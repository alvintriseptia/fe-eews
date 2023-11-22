import STATIONS_DATA from "@/assets/data/stations.json";
import { IStation } from "@/entities/_index";

/**
 * Represents a Station.
 */
class Station implements IStation {
	code: string;
	network: string;
	latitude: number;
	longitude: number;
	creation_date: string;
	elevation: number;
	description: string;

	/**
	 * Saves the station to local storage.
	 * @param code - The code of the station to be saved.
	 */
	saveStation(code: string) {
		// read file
		let stations = JSON.parse(localStorage.getItem("stations"));

		if (!stations) {
			// create file
			localStorage.setItem("stations", JSON.stringify([]));
			// read file
			stations = JSON.parse(localStorage.getItem("stations"));
		}
		// add new station
		stations.push(code);

		// write file
		localStorage.setItem("stations", JSON.stringify(stations));
	}

	/**
	 * Deletes the station from local storage.
	 * @param code - The code of the station to be deleted.
	 */
	deleteStation(code: string) {
		// read file
		let stations = JSON.parse(localStorage.getItem("stations"));

		if (!stations) {
			// create file
			localStorage.setItem("stations", JSON.stringify([]));
			// read file
			stations = JSON.parse(localStorage.getItem("stations"));
		}

		// delete station
		stations.splice(stations.indexOf(code), 1);

		// write file
		localStorage.setItem("stations", JSON.stringify(stations));
	}

	/**
	 * Fetches all saved stations from local storage.
	 * @returns An array of saved stations.
	 */
	fetchSavedStations(): IStation[] {
		// let station_codes = JSON.parse(localStorage.getItem("stations")) || [];

		// // read file
		// let stations = STATIONS_DATA.filter((station: any) => {
		// 	return station_codes.indexOf(station.code) > -1;
		// });

		// return stations
		// return stations;

		// TESTING
		return STATIONS_DATA;
	}

	/**
	 * Fetches a station by its code from local storage.
	 * @param code - The code of the station to be fetched.
	 * @returns The station object.
	 */
	fetchStationByCode(code: string): IStation {
		// read file
		// let stations_code = JSON.parse(localStorage.getItem("stations")) || [];

		// // read file
		// const station_code = stations_code.find((station_code: string) => {
		// 	return station_code === code;
		// });

		// if (!station_code) {
		// 	return null;
		// }

		// read file
		let station = STATIONS_DATA.find((station: IStation) => {
			return station.code === code;
		});

		// return station
		return station;
	}
}

export default Station;
