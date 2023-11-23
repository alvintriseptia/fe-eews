import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import { Seismogram, Station } from "@/models/_index";
import { ISeismogram, IStation } from "@/entities/_index";

/**
 * The StationController class handles the logic for managing stations.
 */
class StationController {
	private station = new Station();
	private seismogram = new Seismogram();
	private seismogramInterval: number;
	private seismogramWorker: Worker;

	constructor() {
		makeObservable(this, {
			station: observable,
			seismogram: observable,
			getStations: action,
			getStationByCode: action,
			addStation: action,
			removeStation: action,
			displaySeismogram: action,
		} as AnnotationsMap<this, any>);
	}

	setSeismogramWorker(seismogramWorker: Worker) {
		this.seismogramWorker = seismogramWorker;
	}

	/**
	 * Retrieves all the saved stations.
	 * @returns An array of IStation objects representing the saved stations.
	 */
	getStations(): IStation[] {
		return this.station.fetchSavedStations();
	}

	/**
	 * Retrieves a station by its code.
	 * @param code - The code of the station to retrieve.
	 * @returns An IStation object representing the station with the specified code.
	 */
	getStationByCode(code: string): IStation {
		return this.station.fetchStationByCode(code);
	}

	/**
	 * Adds a new station.
	 * @param code - The code of the station to add.
	 */
	addStation(code: string) {
		this.station.saveStation(code);
	}

	/**
	 * Removes a station.
	 * @param code - The code of the station to remove.
	 */
	removeStation(code: string) {
		this.station.deleteStation(code);
	}


	/**
	 * Displays the seismogram of a station.
	 * @param seismogram - The seismogram to display.
	 */
	displaySeismogram() {
		console.log("displaying seismogram")
		this.seismogramInterval = window.setInterval(() => {
			this.seismogramWorker.postMessage("test");
		}, 1000);
	}

	/**
	 * stop the seismogram worker.
	 */
	stopSeismogram() {
		console.log("stopping seismogram")
		window.clearInterval(this.seismogramInterval);
	}
}

export default StationController;
