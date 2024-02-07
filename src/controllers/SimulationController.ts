import { IMap } from "@/entities/IMap";
import { IEarthquakeDetection, IStation } from "@/entities/_index";
import {
	EarthquakeDetection,
	EarthquakeHistory,
	Map as TEWSMap,
	Notification,
	Seismogram,
} from "@/models/_index";
import { CoordinateType, RegionType } from "@/types/_index";
import {
	AnnotationsMap,
	action,
	makeObservable,
	observable,
	observe,
} from "mobx";
import STATIONS_DATA from "@/assets/data/stations.json";
import REGENCIES_DATA from "@/assets/data/regencies.json";
import * as turf from "@turf/turf";

/**
 * MainController class responsible for managing the main functionalities of the application.
 */
export default class SimulationController {
	private earthquakeHistory = new EarthquakeHistory();
	private notificationEarthquakeDetection = new Notification();
	private notificationEarthquake = new Notification();
	private notificationSWaveAffected = new Notification();
	private map = new TEWSMap();
	private earthquakeDetectionInterval: NodeJS.Timeout;
	private earthquakeDetectionWorker: Worker;
	private countdown: number = 0;
	earthquakeDetection = new EarthquakeDetection();
	rerender = 0;
	private clearTimeout: NodeJS.Timeout;

	private wavesWorker: Worker;
	private affectedWavesWorker: Worker;
	private affectedPWaves: RegionType[];
	private affectedSWaves: RegionType[];

	private nearestRegencies = REGENCIES_DATA as RegionType[];

	constructor() {
		makeObservable(this, {
			rerender: observable,
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
		
		this.earthquakeDetectionWorker = new Worker(
			new URL("../workers/earthquakeDetection.ts", import.meta.url)
		);

		this.wavesWorker = new Worker(
			new URL("../workers/waves.ts", import.meta.url)
		);
		this.affectedWavesWorker = new Worker(
			new URL("../workers/affectedWaves.ts", import.meta.url)
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
		this.earthquakeDetection.streamEarthquakeDetection(
			this.earthquakeDetectionWorker
		);

		observe(this.earthquakeDetection, "time_stamp", (change) => {
			this.clearEarthquakeDetection(false);
			this.displayEarthquakeDetection();
		});
	}

	async displayEarthquakeDetection() {
		// GET RANDOM STATION (TESTING)
		const stasiun = STATIONS_DATA.find(
			(station) => station.code === this.earthquakeDetection.station
		);

		// EARTHQUAKE PREDICTION LOCATION
		this.map.addEarthquakeDetection(
			{
				longitude: this.earthquakeDetection.long,
				latitude: this.earthquakeDetection.lat,
			},
			stasiun
		);

		// EARTHQUAKE PREDICTION DATA
		let address = await this.map.getAreaName({
			longitude: this.earthquakeDetection.long,
			latitude: this.earthquakeDetection.lat,
		});

		this.notificationEarthquakeDetection.setMessage(
			`Baru saja muncul potensi gempa yang dideteksi oleh stasiun ${stasiun.code}.`
		);
		this.notificationEarthquakeDetection.playNotification();

		// SORTING NEAREST REGENCIES
		//calculate distance between wave center and province center
		this.nearestRegencies.forEach((regency: RegionType) => {
			const distance = turf.distance(
				turf.point([this.earthquakeDetection.long, this.earthquakeDetection.lat]),
				turf.point([regency.longitude, regency.latitude])
			);
			regency.distance = distance;
		});

		//sort by distance
		this.nearestRegencies.sort((a, b) => a.distance! - b.distance!);

		// EARTHQUAKE PREDICTION COUNTDOWN
		this.countdown = 10;
		this.earthquakeDetection.location = address;
		this.earthquakeDetection.countdown = this.countdown;
		this.rerender++;

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
					countdown: -1,
				};

				this.earthquakeDetection.setStatusDetection(
					earthquake.title,
					earthquake.description,
					earthquake.detection,
					earthquake.countdown
				);
				this.rerender++;
				clearInterval(this.earthquakeDetectionInterval);
			}
		}, 1000);

		// WAVE SIMULATION
		this.wavesWorker.postMessage({
			command: "start",
			earthquakeEpicenter: {
				longitude: this.earthquakeDetection.long,
				latitude: this.earthquakeDetection.lat,
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
				if (regenciesData.length > this.affectedSWaves.length) {
					this.notificationSWaveAffected.playNotification();
				}
				this.affectedSWaves = regenciesData;
				this.affectedPWaves = geoJson;
				this.map.addAreaAffectedWaves(data.pWaveImpactedGeoJson, regenciesData);
			}
		};
	}

	disconnectEarthquakeDetection() {
		this.earthquakeDetectionWorker.terminate();
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

			this.rerender = 0;

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

				this.rerender = 0;
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
