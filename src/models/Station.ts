import STATIONS_DATA from "@/assets/data/stations.json";
import { IStation } from "@/entities/_index";
import { ResponseStationsStatus } from "./response/_index";
import * as indexedDB from "@/lib/indexed-db";
import Seismogram from "./Seismogram";

const stations = STATIONS_DATA as IStation[];

/**
 * Represents a Station.
 */
class Station implements IStation {
	ch1: string;
	ch2: string;
	ch3: string;
	ch4: string;
	ch5: string;
	ch6: string;
	timech1: string;
	timech2: string;
	timech3: string;
	timech4: string;
	timech5: string;
	timech6: string;
	latency1: string;
	latency2: string;
	latency3: string;
	latency4: string;
	latency5: string;
	latency6: string;
	color1: string;
	color2: string;
	color3: string;
	color4: string;
	color5: string;
	color6: string;
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
	async fetchSavedStations() {
		const timestamp = new Date().getTime();
		const response = await fetch(
			`/api/station-networks?_=${timestamp}`
		);
		const data = (await response.json()) as IStation[];

		return data;
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

    async initSeismogram(){
        const newSeismograms: Map<string, Seismogram> = new Map([]);
		const enabled_seismograms = (await indexedDB.readFromIndexedDB(
			"seismograms",
			"enabled_seismograms"
		)) as string[] | null;

		// if both enabled_seismograms and disabled_seismograms are null,
		// then save the default stations to indexedDB enabled_seismograms
		if (!enabled_seismograms) {
			indexedDB.writeToIndexedDB({
				objectStore: "seismograms",
				keyPath: "type",
				key: "enabled_seismograms",
				data: stations.map((s) => s.code),
			});
		}

		if (enabled_seismograms) {
			for (let station of enabled_seismograms) {
				newSeismograms.set(station, new Seismogram(station));
			}
        }
        
        return newSeismograms;
    }

	async enableSeismogram(station: string, seismograms: Map<string, Seismogram>) {
        const newSeismograms: Map<string, Seismogram> = seismograms;
		const db_enabled_seismograms = (await indexedDB.readFromIndexedDB(
			"seismograms",
			"enabled_seismograms"
		)) as string[] | null;

		const current_enabled_seismograms = db_enabled_seismograms || [];

		// add to indexedDB
		await indexedDB.writeToIndexedDB({
			objectStore: "seismograms",
			keyPath: "type",
			key: "enabled_seismograms",
			data: [...current_enabled_seismograms, station],
		});

		newSeismograms.set(station, new Seismogram(station));
		
		return newSeismograms;
	}

	async enableAllSeismogram() {
		const newSeismograms: Map<string, Seismogram> = new Map([]);
		// add to indexedDB
		await indexedDB.writeToIndexedDB({
			objectStore: "seismograms",
			keyPath: "type",
			key: "enabled_seismograms",
			data: stations.map((s) => s.code),
		});

		for (let station of stations) {
			newSeismograms.set(station.code, new Seismogram(station.code));
		}

		return newSeismograms;
	}

	async disableSeismogram(station: string, seismograms: Map<string, Seismogram>) {
		const newSeismograms: Map<string, Seismogram> = seismograms;
		// remove from indexedDB
		await indexedDB.writeToIndexedDB({
			objectStore: "seismograms",
			keyPath: "type",
			key: "enabled_seismograms",
			data: [...newSeismograms.keys()].filter((s) => s !== station),
		});

		newSeismograms.delete(station);
		
		return newSeismograms;
	}
}

export default Station;
