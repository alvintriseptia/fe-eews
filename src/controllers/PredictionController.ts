import {EarthquakePrediction, Map, Seismogram} from "@/models/_index";
import { CoordinateType } from "@/types/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";

/**
 * PredictionController class handles the logic for earthquake prediction.
 */
export default class PredictionController {
    private earthquakePrediction = new EarthquakePrediction();
    private map = new Map();
    private seismogram = new Seismogram();

    constructor() {
        makeObservable(this, {
            earthquakePrediction: observable,
            map: observable,
            getHistoryEarthquakePrediction: action,
            addEarthquakePredictionLocations: action,
            filterHistoryEarthquakePrediction: action,
            exportHistoryEarthquakePrediction: action,
            getDetailEarthquakePrediction: action,
            displaySeismogram: action,
            displayError: action,
        } as AnnotationsMap<this, any>);
    }

    /**
     * Retrieves the history of earthquake predictions.
     */
    getHistoryEarthquakePrediction() {}

    /**
     * Adds earthquake prediction locations to the map.
     * @param {CoordinateType[]} locations - The locations of the earthquake predictions.
     */
    addEarthquakePredictionLocations(locations: CoordinateType[]) {
    }

    /**
     * Filters the history of earthquake predictions based on certain criteria.
     */
    filterHistoryEarthquakePrediction() {}

    /**
     * Exports the history of earthquake predictions to a file.
     */
    exportHistoryEarthquakePrediction() {}

    /**
     * Retrieves the detailed information of an earthquake prediction.
     */
    getDetailEarthquakePrediction() {}

    /**
     * Displays the seismogram of an earthquake prediction.
     */
    displaySeismogram() {}


    /**
     * Displays an error message related to earthquake prediction.
     */
    displayError() {}
}