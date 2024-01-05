import { IMap } from "@/entities/IMap";
import { IEarthquakePrediction, IStation } from "@/entities/_index";
import {
	EarthquakePrediction,
	ExternalSource,
	Map as EEWSMap,
	Notification,
	Seismogram,
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
	private externalSource = new ExternalSource();
	private notificationEarthquakePrediction = new Notification();
	private notificationEarthquake = new Notification();
	private notificationSWaveAffected = new Notification();
	private map = new EEWSMap();
	private earthquakePredictionInterval: NodeJS.Timeout;
	private earthquakePredictionWorker: Worker;
	private countdown: number = 0;
	earthquakePrediction = new EarthquakePrediction();
	private clearTimeout: NodeJS.Timeout;

	private seismogramWorker: Worker;

	private pWavesWorker: Worker;
	private affectedPWavesWorker: Worker;
	private affectedPWaves: GeoJsonCollection;

	private sWavesWorker: Worker;
	private affectedSWavesWorker: Worker;
	private affectedSWaves: RegionType[];

	private nearestRegencies = REGENCIES_DATA as RegionType[];

	constructor() {
		makeObservable(this, {
			earthquakePrediction: observable,
			getEarthquakeWeekly: action,
			getLatestEarthquake: action,
			getLatestFeltEarthquake: action,
			getLatestEarthquakePrediction: action,
			connectEarthquakePrediction: action,
			showStations: action,
			showMap: action,
			stopSimulation: action,
		} as AnnotationsMap<this, any>);

		this.notificationEarthquakePrediction.setNotification(
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

		this.affectedPWaves = {
			type: "FeatureCollection",
			features: [],
		};

		this.affectedSWaves = [];
	}

	// EXTERNAL SOURCE

	/**
	 * Retrieves earthquake data for the past week.
	 */
	async getEarthquakeWeekly() {
		return await this.externalSource.fetchEarthquakeWeekly();
	}

	/**
	 * Retrieves the latest earthquake with magnitude 5 or higher.
	 */
	async getLatestEarthquake() {
		return await this.externalSource.fetchLatestEarthquake();
	}

	/**
	 * Retrieves the latest felt earthquake.
	 */
	async getLatestFeltEarthquake() {
		return await this.externalSource.fetchLatestFeltEarthquake();
	}

	// EARTHQUAKE PREDICTION
	/**
	 * Retrieves the latest earthquake prediction.
	 */
	getLatestEarthquakePrediction() {}

	/**
	 * Connects to the earthquake prediction service.
	 */
	connectEarthquakePrediction() {
		this.seismogramWorker = new Worker(
			new URL("../workers/seismogram.ts", import.meta.url)
		);

		this.earthquakePredictionWorker = new Worker(
			new URL("../workers/earthquakePrediction.ts", import.meta.url)
		);

		this.pWavesWorker = new Worker(
			new URL("../workers/pWaves.ts", import.meta.url)
		);

		this.sWavesWorker = new Worker(
			new URL("../workers/sWaves.ts", import.meta.url)
		);

		this.affectedPWavesWorker = new Worker(
			new URL("../workers/affectedPWaves.ts", import.meta.url)
		);

		this.affectedSWavesWorker = new Worker(
			new URL("../workers/affectedSWaves.ts", import.meta.url)
		);
		
		this.earthquakePredictionWorker.postMessage({
			mode: "realtime",
		});

		this.earthquakePredictionWorker.onmessage = async (event: MessageEvent) => {
			const { data } = event;
			const date = new Date(data.time_stamp);

			const earthquakePrediction: IEarthquakePrediction = {
				title: "Terdeteksi Gelombang P",
				description: `Harap perhatian, muncul deteksi gelombang P di stasiun ${data.station}`,
				time_stamp: date.getTime(),
				depth: data.depth,
				lat: data.lat,
				long: data.long,
				mag: data.mag,
				prediction: "warning",
				countdown: 10,
				station: data.station,
			};

			if (earthquakePrediction.prediction === "warning") {
				this.clearEarthquakePrediction(false);

				// GET RANDOM STATION (TESTING)
				const stasiun = STATIONS_DATA.find(
					(station) => station.code === earthquakePrediction.station
				);

				// EARTHQUAKE PREDICTION LOCATION
				this.map.addEarthquakePrediction(
					{
						longitude: earthquakePrediction.long,
						latitude: earthquakePrediction.lat,
					},
					stasiun
				);

				// EARTHQUAKE PREDICTION DATA
				this.countdown = 10;
				this.earthquakePrediction = new EarthquakePrediction(
					earthquakePrediction
				);
				let address = await this.map.getAreaName({
					longitude: earthquakePrediction.long,
					latitude: earthquakePrediction.lat,
				});

				this.notificationEarthquakePrediction.setMessage(
					`Baru saja muncul potensi gempa yang dideteksi oleh stasiun ${stasiun.code}.`
				);
				this.notificationEarthquakePrediction.playNotification();

				// SORTING NEAREST REGENCIES
				//calculate distance between wave center and province center
				this.nearestRegencies.forEach((regency: RegionType) => {
					const distance = turf.distance(
						turf.point([earthquakePrediction.long, earthquakePrediction.lat]),
						turf.point([regency.longitude, regency.latitude])
					);
					regency.distance = distance;
				});

				//sort by distance
				this.nearestRegencies.sort((a, b) => a.distance! - b.distance!);

				// EARTHQUAKE PREDICTION COUNTDOWN
				this.earthquakePredictionInterval = setInterval(() => {
					this.countdown--;
					if (this.countdown === 0) {
						this.notificationEarthquake.setMessage(`
						Harap perhatian, telah terjadi gempa bumi di wilayah ${address}. Gelombang ini dideteksi oleh stasiun ${stasiun.code}. Harap segera lakukan tindakan mitigasi, terima kasih`);
						this.notificationEarthquake.playNotification();
						const earthquake = {
							title: "Terjadi Gempa Bumi",
							prediction: "earthquake",
							description: `Perhatian! telah terjadi gempa bumi di wilayah ${address}, segera lakukan tindakan mitigasi!`,
							time_stamp: date.getTime() + 10000,
							depth: this.earthquakePrediction.depth,
							lat: this.earthquakePrediction.lat,
							long: this.earthquakePrediction.long,
							mag: this.earthquakePrediction.mag,
							countdown: -1,
						};

						this.earthquakePrediction = new EarthquakePrediction(
							earthquake as IEarthquakePrediction
						);

						clearInterval(this.earthquakePredictionInterval);
					}
				}, 1000);

				// EARTHQUAKE PREDICTION PWAVE
				this.pWavesWorker.postMessage({
					command: "start",
					earthquakeEpicenter: {
						longitude: earthquakePrediction.long,
						latitude: earthquakePrediction.lat,
					},
				});

				this.pWavesWorker.onmessage = (event: MessageEvent) => {
					const data = event.data;
					const pWave = data.pWave;
					this.map.simulatePWaves(pWave);

					// EARTHQUAKE PREDICTION AFFECTED AREA PWAVE
					this.affectedPWavesWorker.postMessage({
						nearestRegencies: this.nearestRegencies,
						pWave: pWave,
						pWaveImpacted: this.affectedPWaves,
					});
				};

				// EARTHQUAKE PREDICTION SWAVE
				this.sWavesWorker.postMessage({
					command: "start",
					earthquakeEpicenter: {
						longitude: earthquakePrediction.long,
						latitude: earthquakePrediction.lat,
					},
				});

				this.sWavesWorker.onmessage = (event: MessageEvent) => {
					const data = event.data;
					const sWave = data.sWave;
					this.map.simulateSWaves(sWave);

					// EARTHQUAKE PREDICTION AFFECTED AREA SWAVE
					this.affectedSWavesWorker.postMessage({
						nearestRegencies: this.nearestRegencies,
						sWave: sWave,
						sWaveImpacted: this.affectedSWaves,
						earthquakePrediction: this.earthquakePrediction,
					});
				};

				// GET AFFECTED AREA P-WAVES
				this.affectedPWavesWorker.onmessage = (event: MessageEvent) => {
					const geoJson = event.data;
					this.affectedPWaves = geoJson;
					this.map.addAreaAffectedPWave(geoJson);
				};

				// GET AFFECTED AREA S-WAVES
				this.affectedSWavesWorker.onmessage = (event: MessageEvent) => {
					const data = event.data;

					if (data.message == "stop") {
						this.stopSimulation();
						this.clearEarthquakePrediction(true);
					} else {
						const regenciesData = data.sWaveImpacted;
						this.affectedSWaves = regenciesData;
						this.map.addAreaAffectedSWave(regenciesData);
						this.notificationSWaveAffected.playNotification();
					}
				};
			}
		};
	}

	disconnectEarthquakePrediction() {
		this.earthquakePredictionWorker.terminate();
		this.earthquakePredictionWorker = null;
		clearInterval(this.earthquakePredictionInterval);
	}

	clearEarthquakePrediction(delay: boolean) {
		if (!delay) {
			this.stopSimulation();

			if (this.affectedPWaves.features.length > 0) {
				this.affectedPWaves = {
					type: "FeatureCollection",
					features: [],
				};
			}

			if (this.affectedSWaves.length > 0) {
				this.affectedSWaves = [];
			}

			this.earthquakePrediction = new EarthquakePrediction();

			this.map.clearEarthquakePrediction();

			clearTimeout(this.clearTimeout);
			clearInterval(this.earthquakePredictionInterval);
		} else {
			this.clearTimeout = setTimeout(() => {
				if (this.affectedPWaves.features.length > 0) {
					this.affectedPWaves = {
						type: "FeatureCollection",
						features: [],
					};
				}

				if (this.affectedSWaves.length > 0) {
					this.affectedSWaves = [];
				}

				this.earthquakePrediction = new EarthquakePrediction();

				this.map.clearEarthquakePrediction();
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
		if (this.pWavesWorker) {
			this.pWavesWorker.postMessage({
				command: "stop",
			});
		} 
		
		if (this.sWavesWorker) {
			this.sWavesWorker.postMessage({
				command: "stop",
			});
		}

		this.map.stopSimulation();
	}
}
