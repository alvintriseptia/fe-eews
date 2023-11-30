import { EarthquakePrediction, Map } from "@/models/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import mapStyle from "@/assets/data/dataviz_dark.json";
import { StyleSpecification } from "maplibre-gl";
import { IEarthquakePrediction } from "@/entities/_index";

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
			// filterHistoryEarthquakePrediction: action,
			exportHistoryEarthquakePrediction: action,
			getSeismogramEarthquakePrediction: action,
			displayError: action,
		} as AnnotationsMap<this, any>);
	}

	/**
	 * Retrieves the history of earthquake predictions.
	 */
	async getHistoryEarthquakePrediction(start_date?: number, end_date?: number) {
		let earthquakePredictions = [] as IEarthquakePrediction[];
		if (start_date && end_date) {
			const response =
				await this.earthquakePrediction.fetchHistoryEarthquakePrediction(
					start_date,
					end_date
				);

			earthquakePredictions = response;
		} else {
			const now = new Date().getTime();
			const lastWeek = now - 30 * 24 * 60 * 60 * 1000;
			const response =
				await this.earthquakePrediction.fetchHistoryEarthquakePrediction(
					lastWeek,
					now
				);

			earthquakePredictions = response;
		}

		if (earthquakePredictions.length) {
			// get addresses
			for (const prediction of earthquakePredictions) {
				const address = await this.map.getAreaName({
					latitude: prediction.lat,
					longitude: prediction.long,
				});
				prediction.location = address;
			}
		} else {
			this.displayError("Data tidak ditemukan");
			return {
				data: [],
			}
		}

		return {
			data: earthquakePredictions,
		};
	}

	addEarthquakePredictionLocations(predictions: IEarthquakePrediction[]) {
		this.map.initMap({
			id: "eews-history-map",
			mapStyle: this.style,
			zoom: 5,
			initialViewState: {
				latitude: -2.600029,
				longitude: 118.015776,
			},
		});

		this.map.addEarthquakePredictionLocations(predictions);
	}

	/**
	 * Exports the history of earthquake predictions to a file.
	 */
	exportHistoryEarthquakePrediction() {}

	/**
	 * Retrieves the detailed information of an earthquake prediction.
	 */
	async getSeismogramEarthquakePrediction(station: string, time_stamp: number) {
		const start_date = new Date(time_stamp).getTime() - 180;
		const end_date = new Date(time_stamp).getTime() + 180;
		const response =
			await this.earthquakePrediction.fetchSeismogramEarthquakePrediction(
				station,
				start_date,
				end_date
			);

		if (!response) {
			this.displayError("Data tidak ditemukan");
		}

		return response;
	}

	/**
	 * Displays an error message related to earthquake prediction.
	 */
	displayError(message: string) {
		this.error = message;
	}
}
