import { IMap } from "@/entities/IMap";
import { IStation } from "@/entities/_index";
import {
	EarthquakePrediction,
	ExternalSource,
	Map,
	Notification,
	Seismogram,
} from "@/models/_index";
import { CoordinateType } from "@/types/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";

/**
 * MainController class responsible for managing the main functionalities of the application.
 */
export default class MainController {
	private seismogram = new Seismogram();
	private externalSource = new ExternalSource();
	private notification = new Notification();
	private earthquakePrediction = new EarthquakePrediction();
	private map = new Map();

	constructor() {
		makeObservable(this, {
			seismogram: observable,
			externalSource: observable,
			notification: observable,
			earthquakePrediction: observable,
			map: observable,
            getEarthquakeWeekly: action,
            showEarthquakeWeekly: action,
            getLatestEarthquake: action,
            getLatestFeltEarthquake: action,
            getLatestEarthquakePrediction: action,
            connectEarthquakePrediction: action,
            connectSeismogram: action,
            showStations: action,
            showMap: action,
            stopSimulation: action,
		} as AnnotationsMap<this, any>);
	}

    // EXTERNAL SOURCE

    /**
     * Retrieves earthquake data for the past week.
     */
    async getEarthquakeWeekly() {
       return await this.externalSource.fetchEarthquakeWeekly();
    }

    /**
     * Displays the earthquake data for the past week.
     */
    showEarthquakeWeekly() {}

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
    connectEarthquakePrediction() {}

    // SEISMOGRAM

    /**
     * Connects to the seismogram service.
     */
    connectSeismogram() {}

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
    stopSimulation() {}
}
