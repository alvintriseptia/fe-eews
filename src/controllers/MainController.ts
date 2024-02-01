import { IMap } from "@/entities/IMap";
import { IEarthquakeDetection, IStation } from "@/entities/_index";
import {
	EarthquakeDetection,
	EarthquakeHistory,
	Map as TEWSMap,
	Notification,
} from "@/models/_index";
import { CoordinateType, GeoJsonCollection, RegionType } from "@/types/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import STATIONS_DATA from "@/assets/data/stations.json";
import REGENCIES_DATA from "@/assets/data/regencies.json";
import * as turf from "@turf/turf";

/**
 * MainController class responsible for managing the main functionalities of the application.
 */
export default class MainController {
	private earthquakeHistory = new EarthquakeHistory();
	private notificationEarthquakeDetection = new Notification();
	private notificationEarthquake = new Notification();
	private notificationSWaveAffected = new Notification();
	private map = new TEWSMap();
	private earthquakeDetectionInterval: NodeJS.Timeout;
	private earthquakeDetectionWorker: Worker;
	private countdown: number = 0;
	earthquakeDetection = new EarthquakeDetection();
	private clearTimeout: NodeJS.Timeout;

	private wavesWorker: Worker;
	private affectedWavesWorker: Worker;
	private affectedPWaves: RegionType[];
	private affectedSWaves: RegionType[];

	private nearestRegencies = REGENCIES_DATA as RegionType[];

	constructor() {
		makeObservable(this, {
			earthquakeDetection: observable,
			getEarthquakeWeekly: action,
			getLatestEarthquake: action,
			getLatestFeltEarthquake: action,
			connectEarthquakeDetection: action,
			disconnectEarthquakeDetection: action,
			clearEarthquakeDetection: action,
			setOnViewCenter: action,
			showStations: action,
			showMap: action,
			stopSimulation: action,
		} as AnnotationsMap<this, any>);

		this.notificationEarthquakeDetection.setNotification(
			"Peringatan Gempa",
			"/audio/tingtong.mp3",
			"",
			2000
		);

		this.notificationEarthquake.setNotification(
			"Terjadi Gempa",
			"/audio/earthquake_alarm.mp3",
			"",
			25000
		);

		this.notificationSWaveAffected.setNotification(
			"Area Terdampak Gempa",
			"/audio/bell.mp3",
			"",
			1000
		);

		this.affectedPWaves = [];
		this.affectedSWaves = [];
	}

	// EXTERNAL SOURCE

	/**
	 * Retrieves earthquake data for the past week.
	 */
	async getEarthquakeWeekly() {
		return await this.earthquakeHistory.fetchEarthquakeWeekly();
	}

	/**
	 * Retrieves the latest earthquake with magnitude 5 or higher.
	 */
	async getLatestEarthquake() {
		return await this.earthquakeHistory.fetchLatestEarthquake();
	}

	/**
	 * Retrieves the latest felt earthquake.
	 */
	async getLatestFeltEarthquake() {
		return await this.earthquakeHistory.fetchLatestFeltEarthquake();
	}

	/**
	 * Connects to the earthquake detection service.
	 */
	connectEarthquakeDetection() {
		this.earthquakeDetectionWorker = new Worker(
			new URL("../workers/earthquakeDetection.ts", import.meta.url)
		);

		this.wavesWorker = new Worker(
			new URL("../workers/waves.ts", import.meta.url)
		);

		this.affectedWavesWorker = new Worker(
			new URL("../workers/affectedWaves.ts", import.meta.url)
		);
		
		this.earthquakeDetectionWorker.postMessage({
			mode: "realtime",
		});

		this.earthquakeDetectionWorker.onmessage = async (event: MessageEvent) => {
			const { data } = event;
			const date = new Date(data.time_stamp);
			const offset = new Date().getTimezoneOffset() * 60 * 1000;
			date.setTime(date.getTime() - offset);

			const earthquakeDetection: IEarthquakeDetection = {
				title: "Terdeteksi Gelombang P",
				description: `Harap perhatian, muncul deteksi gelombang P di stasiun ${data.station}`,
				time_stamp: date.getTime(),
				depth: data.depth,
				lat: data.lat,
				long: data.long,
				mag: data.mag,
				detection: "warning",
				countdown: 10,
				station: data.station,
			};

			if (earthquakeDetection.detection === "warning") {
				this.clearEarthquakeDetection(false);

				// GET RANDOM STATION (TESTING)
				const stasiun = STATIONS_DATA.find(
					(station) => station.code === earthquakeDetection.station
				);

				// EARTHQUAKE PREDICTION LOCATION
				this.map.addEarthquakeDetection(
					{
						longitude: earthquakeDetection.long,
						latitude: earthquakeDetection.lat,
					},
					stasiun
				);

				// EARTHQUAKE PREDICTION DATA
				this.countdown = 10;
				this.earthquakeDetection = new EarthquakeDetection(
					earthquakeDetection
				);
				let address = await this.map.getAreaName({
					longitude: earthquakeDetection.long,
					latitude: earthquakeDetection.lat,
				});

				this.notificationEarthquakeDetection.setMessage(
					`Baru saja muncul potensi gempa yang dideteksi oleh stasiun ${stasiun.code}.`
				);
				this.notificationEarthquakeDetection.playNotification();

				// SORTING NEAREST REGENCIES
				//calculate distance between wave center and province center
				this.nearestRegencies.forEach((regency: RegionType) => {
					const distance = turf.distance(
						turf.point([earthquakeDetection.long, earthquakeDetection.lat]),
						turf.point([regency.longitude, regency.latitude])
					);
					regency.distance = distance;
				});

				//sort by distance
				this.nearestRegencies.sort((a, b) => a.distance! - b.distance!);

				// EARTHQUAKE PREDICTION COUNTDOWN
				this.earthquakeDetectionInterval = setInterval(() => {
					this.countdown--;
					if (this.countdown === 0) {
						this.notificationEarthquake.setMessage(`
						Harap perhatian, telah terjadi gempa bumi di wilayah ${address}. Gelombang ini dideteksi oleh stasiun ${stasiun.code}. Harap segera lakukan tindakan mitigasi, terima kasih`);
						this.notificationEarthquake.playNotification();
						const earthquake = {
							title: "Terjadi Gempa Bumi",
							detection: "earthquake",
							description: `Perhatian! telah terjadi gempa bumi di wilayah ${address}, segera lakukan tindakan mitigasi!`,
							time_stamp: date.getTime() + 10000,
							depth: this.earthquakeDetection.depth,
							lat: this.earthquakeDetection.lat,
							long: this.earthquakeDetection.long,
							mag: this.earthquakeDetection.mag,
							countdown: -1,
						};

						this.earthquakeDetection = new EarthquakeDetection(
							earthquake as IEarthquakeDetection
						);

						clearInterval(this.earthquakeDetectionInterval);
					}
				}, 1000);

				// WAVE SIMULATION
				this.wavesWorker.postMessage({
					command: "start",
					earthquakeEpicenter: {
						longitude: earthquakeDetection.long,
						latitude: earthquakeDetection.lat,
					},
				});

				this.wavesWorker.onmessage = (event: MessageEvent) => {
					const data = event.data;
					const pWave = data.pWave;
					const sWave = data.sWave;
					this.map.simulateWaves(pWave, sWave);

					this.affectedWavesWorker.postMessage({
						nearestRegencies: this.nearestRegencies,
						pWave: pWave,
						pWaveImpacted: this.affectedPWaves,
						sWave: sWave,
						sWaveImpacted: this.affectedSWaves,
						earthquakeDetection: this.earthquakeDetection,
					});
				};

				// // GET AFFECTED AREA WAVES
				this.affectedWavesWorker.onmessage = (event: MessageEvent) => {
					const data = event.data;
					if (data.message == "stop") {
						this.stopSimulation();
						this.clearEarthquakeDetection(true);
					} else {
						const regenciesData = data.sWaveImpacted;
						const geoJson = data.pWaveImpacted;
						if(regenciesData.length > this.affectedSWaves.length) {
							this.notificationSWaveAffected.playNotification();
						}
						this.affectedSWaves = regenciesData;
						this.affectedPWaves = geoJson;
						this.map.addAreaAffectedWaves(geoJson, regenciesData);
					}
				};
			}
		};
	}

	disconnectEarthquakeDetection() {
		this.earthquakeDetectionWorker?.terminate();
		this.earthquakeDetectionWorker = null;
		clearInterval(this.earthquakeDetectionInterval);
	}

	clearEarthquakeDetection(delay: boolean) {
		if (!delay) {
			this.stopSimulation();
			this.map.clearEarthquakeDetection();


			if (this.affectedPWaves.length > 0) {
				this.affectedPWaves = [];
			}

			if (this.affectedSWaves.length > 0) {
				this.affectedSWaves = [];
			}

			this.earthquakeDetection = new EarthquakeDetection();

			clearTimeout(this.clearTimeout);
			clearInterval(this.earthquakeDetectionInterval);
		} else {
			this.stopSimulation();
			this.map.clearWaves();
			this.clearTimeout = setTimeout(() => {
				this.map.clearEarthquakeDetection();

				if (this.affectedPWaves.length > 0) {
					this.affectedPWaves = [];
				}

				if (this.affectedSWaves.length > 0) {
					this.affectedSWaves = [];
				}

				this.earthquakeDetection = new EarthquakeDetection();
			}, 180000);
		}
	}
	// MAP

	/**
	 * Displays the stations on the map.
	 */
	showStations(stations: IStation[]) {
		this.map.addStations(stations);
	}

	/**
	 * Displays the map.
	 */
	showMap(map: IMap) {
		this.map.initMap(map);
	}

	setOnViewCenter(coordinate: CoordinateType, zoom?: number) {
		this.map.setOnViewCenter(coordinate, zoom);
	}

	/**
	 * Stops the simulation.
	 */
	stopSimulation() {
		if (this.wavesWorker) {
			this.wavesWorker.postMessage({
				command: "stop",
			});
		}
	}
}
