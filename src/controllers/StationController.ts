import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import { Station } from "@/models/_index";
import { IStation } from "@/entities/_index";

/**
 * The StationController class handles the logic for managing stations.
 */
class StationController {
	private station = new Station();

	constructor() {
		makeObservable(this, {
			station: observable,
			getStations: action,
			getStationByCode: action,
			addStation: action,
			removeStation: action,
		} as AnnotationsMap<this, any>);
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
}

export default StationController;
