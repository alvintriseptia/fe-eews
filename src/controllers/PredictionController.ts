import { EarthquakePrediction, Map, Seismogram } from "@/models/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import mapStyle from '@/assets/data/dataviz_dark.json';
import { StyleSpecification } from "maplibre-gl";

/**
 * PredictionController class handles the logic for earthquake prediction.
 */
export default class PredictionController {
	earthquakePrediction = new EarthquakePrediction();
	private map = new Map();
    private style = mapStyle as StyleSpecification;
	error: string = "";

	constructor() {
		makeObservable(this, {
			earthquakePrediction: observable,
			error: observable,
			map: observable,
			getHistoryEarthquakePrediction: action,
			filterHistoryEarthquakePrediction: action,
			exportHistoryEarthquakePrediction: action,
			getDetailEarthquakePrediction: action,
			displayError: action,
		} as AnnotationsMap<this, any>);
	}

	/**
	 * Retrieves the history of earthquake predictions.
	 */
	async getHistoryEarthquakePrediction() {
		this.map.initMap({
			id: "eews-history-map",
			mapStyle: this.style,
			zoom: 5,
			initialViewState: {
				latitude: -2.600029,
				longitude: 118.015776,
			},
		});

		const historyEarthquakePredictions = await this.earthquakePrediction.fetchHistoryEarthquakePrediction();

		this.map.addEarthquakePredictionLocations(historyEarthquakePredictions);
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
	 * Displays an error message related to earthquake prediction.
	 */
	displayError(message: string) {
		this.error = message;
	}
}
