import {
	EarthquakePrediction,
	ExternalSource,
	Map,
	Notification,
	Seismogram,
} from "@/models/_index";
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
            getLatestM5Earthquake: action,
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
    getEarthquakeWeekly() {}

    /**
     * Displays the earthquake data for the past week.
     */
    showEarthquakeWeekly() {}

    /**
     * Retrieves the latest earthquake with magnitude 5 or higher.
     */
    getLatestM5Earthquake() {}

    /**
     * Retrieves the latest felt earthquake.
     */
    getLatestFeltEarthquake() {}

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
    showStations() {}

    /**
     * Displays the map.
     */
    showMap() {}

    /**
     * Stops the simulation.
     */
    stopSimulation() {}
}
