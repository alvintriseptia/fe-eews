import { EarthquakeDetection, Map } from "@/models/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import { IEarthquakeDetection, IMap } from "@/entities/_index";
import toast from "react-hot-toast";
import { CoordinateType } from "@/types/_index";

interface IEarthquakeDetectionResponse {
	data: IEarthquakeDetection[];
	total: number;
}

/**
 * HistoryController class handles the logic for earthquake detection.
 */
export default class HistoryController {
	private earthquakeDetection = new EarthquakeDetection();
	private map = new Map();

	constructor() {
		makeObservable(this, {
			map: observable,
			getHistoryEarthquakeDetection: action,
			getLatestEarthquakeDetection: action,
			exportHistoryEarthquakeDetection: action,
			getDetailEarthquakeDetection: action,
			displayError: action,
		} as AnnotationsMap<this, any>);
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

	/**
	 * Retrieves the history of earthquake detections.
	 */
	async getHistoryEarthquakeDetection(start_date: number, end_date: number) {
		try {
			document.querySelector("#loading_overlay").className = "block";

			const response =
				await this.earthquakeDetection.fetchHistoryEarthquakeDetection(
					start_date,
					end_date
				);

			const earthquakeDetections =
				response as unknown as IEarthquakeDetectionResponse | null;
			if (earthquakeDetections) {
				// get addresses
				this.map.addEarthquakeDetectionLocations(earthquakeDetections.data);
				for (const detection of Object.values(earthquakeDetections.data)) {
					const address = await this.map.getAreaName({
						latitude: detection.lat,
						longitude: detection.long,
					});
					detection.location = address;
				}

				return {
					data: Object.values(earthquakeDetections.data),
					total: earthquakeDetections.total,
				};
			} else {
				return {
					data: [],
					total: 0,
				};
			}
		} catch (error) {
			return {
				data: [],
				total: 0,
			};
		} finally {
			document.querySelector("#loading_overlay").className = "hidden";
		}
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
	async exportHistoryEarthquakeDetection(start_date: number, end_date: number) {
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
	 * Displays the map.
	 */
	showMap(map: IMap) {
		this.map.initMap(map);
	}

	/**
	 * Displays an error message related to earthquake detection.
	 */
	displayError(message: string) {
		toast.error(message);
	}
}
