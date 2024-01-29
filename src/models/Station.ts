import STATIONS_DATA from "@/assets/data/stations.json";
import { IStation } from "@/entities/_index";
import { ResponseStationsStatus } from "./response/_index";
const stations = STATIONS_DATA as IStation[];

/**
 * Represents a Station.
 */
class Station {
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
	fetchSavedStations() {
		// const timestamp = new Date().getTime();
		// const response = await fetch(
		// 	`http://202.90.198.40/sismon-slmon/data/slmon.all.laststatus.json?_=${timestamp}`
		// );
		// const data = (await response.json()) as ResponseStationsStatus;

		// const stationsStatus = data.features;

		// for (const item of stationsStatus) {
		// 	const station = stations.find((station) => {
		// 		return station.code === item.properties.sta;
		// 	});

		// 	if (!station) {
		// 		continue;
		// 	}

		// 	station.network = item.properties.net;
		// 	station.latitude = parseFloat(item.geometry.coordinates[1]);
		// 	station.longitude = parseFloat(item.geometry.coordinates[0]);
		// 	station.creation_date = item.properties.time;
		// 	station.elevation = item.geometry.coordinates[2];
		// 	station.ch1 = item.properties.ch1;
		// 	station.ch2 = item.properties.ch2;
		// 	station.ch3 = item.properties.ch3;
		// 	station.ch4 = item.properties.ch4;
		// 	station.ch5 = item.properties.ch5;
		// 	station.ch6 = item.properties.ch6;
		// 	station.timech1 = item.properties.timech1;
		// 	station.timech2 = item.properties.timech2;
		// 	station.timech3 = item.properties.timech3;
		// 	station.timech4 = item.properties.timech4;
		// 	station.timech5 = item.properties.timech5;
		// 	station.timech6 = item.properties.timech6;
		// 	station.latency1 = item.properties.latency1;
		// 	station.latency2 = item.properties.latency2;
		// 	station.latency3 = item.properties.latency3;
		// 	station.latency4 = item.properties.latency4;
		// 	station.latency5 = item.properties.latency5;
		// 	station.latency6 = item.properties.latency6;
		// 	station.color1 = item.properties.color1;
		// 	station.color2 = item.properties.color2;
		// 	station.color3 = item.properties.color3;
		// 	station.color4 = item.properties.color4;
		// 	station.color5 = item.properties.color5;
		// 	station.color6 = item.properties.color6;
		// }

		return stations;
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
		let station = stations.find((station: IStation) => {
			return station.code === code;
		});

		// return station
		return station;
	}
}

export default Station;
