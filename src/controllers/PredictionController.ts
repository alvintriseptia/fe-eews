import { EarthquakePrediction, Map } from "@/models/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import mapStyle from "@/assets/data/dataviz_dark.json";
import { StyleSpecification } from "maplibre-gl";
import { IEarthquakePrediction } from "@/entities/_index";
import toast from "react-hot-toast";
import { CoordinateType } from "@/types/_index";

/**
 * PredictionController class handles the logic for earthquake prediction.
 */
export default class PredictionController {
	private earthquakePrediction = new EarthquakePrediction();
	private map = new Map();
	private style = mapStyle as StyleSpecification;

	constructor() {
		makeObservable(this, {
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
		try {
			const now = new Date().getTime();
			const lastWeek = now - 30 * 24 * 60 * 60 * 1000;
			const response =
				await this.earthquakePrediction.fetchHistoryEarthquakePrediction(
					lastWeek,
					now
				);

			const earthquakePredictions = response;

			if (earthquakePredictions.length) {
				// get addresses
				return {
					data: earthquakePredictions,
				};
			} else {
				return {
					data: [],
				};
			}
		} catch (error) {
			return {
				data: [],
			};
		}
	}

	async getLatestEarthquakePrediction() {
		try {
			const response =
				await this.earthquakePrediction.fetchLatestEarthquakePrediction();

			const earthquakePrediction = response;

			if (earthquakePrediction) {
				return earthquakePrediction;
			} else {
				return null;
			}
		} catch (error) {
			return null;
		}
	}

	async filterHistoryEarthquakePrediction(
		start_date: number,
		end_date: number
	) {
		try {
			document.querySelector("#loading_overlay").className = "block";

			const response =
				await this.earthquakePrediction.fetchHistoryEarthquakePrediction(
					start_date,
					end_date
				);

			const earthquakePredictions = response;

			if (earthquakePredictions.length) {
				// get addresses
				let result = [] as IEarthquakePrediction[];

				for (const prediction of earthquakePredictions) {
					const address = await this.map.getAreaName({
						latitude: prediction.lat,
						longitude: prediction.long,
					});
					prediction.location = address;
					result.push(prediction);
				}

				return result;
			} else {
				return [];
			}
		} catch (error) {
			return [];
		} finally {
			document.querySelector("#loading_overlay").className = "hidden";
		}
	}

	async addEarthquakePredictionLocations(predictions: IEarthquakePrediction[]) {
		document.querySelector("#loading_overlay").className = "block";
		this.map.initMap({
			id: "eews-history-map",
			mapStyle: this.style,
			zoom: 5,
			initialViewState: {
				latitude: -2.600029,
				longitude: 118.015776,
			},
		});

		if (!predictions[0].location) {
			let result = [] as IEarthquakePrediction[];

			// for (const prediction of predictions) {
			// 	const address = await this.map.getAreaName({
			// 		latitude: prediction.lat,
			// 		longitude: prediction.long,
			// 	});
			// 	prediction.location = address;
			// 	result.push(prediction);
			// }
			document.querySelector("#loading_overlay").className = "hidden";

			this.map.addEarthquakePredictionLocations(predictions);
			return predictions;
		}

		this.map.addEarthquakePredictionLocations(predictions);
		document.querySelector("#loading_overlay").className = "hidden";
	}

	/**
	 * Retrieves the detailed information of an earthquake prediction.
	 */
	async getDetailEarthquakePrediction(
		station: string,
		time_stamp: number,
		coordinate: CoordinateType
	) {
		try {
			document.querySelector("#loading_overlay").className = "block";
			this.map.setOnViewCenter(coordinate, 10);
			const offset = new Date().getTimezoneOffset() * 60 * 1000;
			const date = new Date(time_stamp);
			date.setTime(date.getTime() - offset);
			// 1 minute before
			const start_date = date.getTime() - 1 * 60 * 1000;
			// 1 minute after
			const end_date = date.getTime() + 1 * 60 * 1000;

			const response =
				await this.earthquakePrediction.fetchSeismogramEarthquakePrediction(
					station,
					start_date,
					end_date
				);
			if (!response) {
				return;
			}

			return response;
		} catch (error) {
			return [];
		} finally {
			document.querySelector("#loading_overlay").className = "hidden";
		}
	}

	/**
	 * Exports the history of earthquake predictions to a file.
	 */
	async exportHistoryEarthquakePrediction(
		start_date: number,
		end_date: number
	) {
		try {
			document.querySelector("#loading_overlay").className = "block";
			await this.earthquakePrediction.exportHistoryEarthquakePrediction(
				start_date,
				end_date
			);
		} catch (error) {
			this.displayError(error.message);
		} finally {
			document.querySelector("#loading_overlay").className = "hidden";
		}
	}

	/**
	 * Displays an error message related to earthquake prediction.
	 */
	displayError(message: string) {
		toast.error(message);
	}
}
