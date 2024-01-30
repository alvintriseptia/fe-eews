import { EarthquakeDetection, Map } from "@/models/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import mapStyle from "@/assets/data/inatews_dark.json";
import { StyleSpecification } from "maplibre-gl";
import { IEarthquakeDetection } from "@/entities/_index";
import toast from "react-hot-toast";
import { CoordinateType } from "@/types/_index";

/**
 * DetectionController class handles the logic for earthquake detection.
 */
export default class DetectionController {
	private earthquakeDetection = new EarthquakeDetection();
	private map = new Map();
	private style = mapStyle as StyleSpecification;

	constructor() {
		makeObservable(this, {
			map: observable,
			getHistoryEarthquakeDetection: action,
			filterHistoryEarthquakeDetection: action,
			exportHistoryEarthquakeDetection: action,
			getDetailEarthquakeDetection: action,
			displayError: action,
		} as AnnotationsMap<this, any>);
	}

	/**
	 * Retrieves the history of earthquake detections.
	 */
	async getHistoryEarthquakeDetection() {
		try {
			const now = new Date().getTime();
			const lastWeek = now - 30 * 24 * 60 * 60 * 1000;
			const response =
				await this.earthquakeDetection.fetchHistoryEarthquakeDetection(
					lastWeek,
					now
				);

			const earthquakeDetections = response;

			if (earthquakeDetections.length) {
				// get addresses
				return {
					data: earthquakeDetections,
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

	async getLatestEarthquakeDetection() {
		try {
			const response =
				await this.earthquakeDetection.fetchLatestEarthquakeDetection();

			const earthquakeDetection = response;

			if (earthquakeDetection) {
				return earthquakeDetection;
			} else {
				return null;
			}
		} catch (error) {
			return null;
		}
	}

	async filterHistoryEarthquakeDetection(
		start_date: number,
		end_date: number
	) {
		try {
			document.querySelector("#loading_overlay").className = "block";

			const response =
				await this.earthquakeDetection.fetchHistoryEarthquakeDetection(
					start_date,
					end_date
				);

			const earthquakeDetections = response;

			if (earthquakeDetections.length) {
				// get addresses
				let result = [] as IEarthquakeDetection[];

				for (const detection of earthquakeDetections) {
					const address = await this.map.getAreaName({
						latitude: detection.lat,
						longitude: detection.long,
					});
					detection.location = address;
					result.push(detection);
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

	async addEarthquakeDetectionLocations(detections: IEarthquakeDetection[]) {
		document.querySelector("#loading_overlay").className = "block";
		this.map.initMap({
			id: "tews-history-map",
			mapStyle: this.style,
			zoom: 5,
			initialViewState: {
				latitude: -2.600029,
				longitude: 118.015776,
			},
		});

		if(detections.length) {
			if (!detections[0].location) {
				let result = [] as IEarthquakeDetection[];
	
				// for (const detection of detections) {
				// 	const address = await this.map.getAreaName({
				// 		latitude: detection.lat,
				// 		longitude: detection.long,
				// 	});
				// 	detection.location = address;
				// 	result.push(detection);
				// }
				document.querySelector("#loading_overlay").className = "hidden";
	
				this.map.addEarthquakeDetectionLocations(detections);
				return detections;
			}
	
			this.map.addEarthquakeDetectionLocations(detections);
		}
		
		document.querySelector("#loading_overlay").className = "hidden";
	}

	/**
	 * Retrieves the detailed information of an earthquake detection.
	 */
	async getDetailEarthquakeDetection(
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
				await this.earthquakeDetection.fetchSeismogramEarthquakeDetection(
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
	 * Exports the history of earthquake detections to a file.
	 */
	async exportHistoryEarthquakeDetection(
		start_date: number,
		end_date: number
	) {
		try {
			document.querySelector("#loading_overlay").className = "block";
			await this.earthquakeDetection.exportHistoryEarthquakeDetection(
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
	 * Displays an error message related to earthquake detection.
	 */
	displayError(message: string) {
		toast.error(message);
	}
}
