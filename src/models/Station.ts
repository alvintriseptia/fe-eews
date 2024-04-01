import STATIONS_DATA from "@/assets/data/stations.json";
import { IStation } from "@/entities/_index";
import Seismogram from "./Seismogram";
import IndexedDB from "@/lib/IndexedDB";

// let stations = [] as IStation[];

/**
 * Represents a Station.
 */
// Get API host
require('dotenv').config(); 
const apiHost = process.env.API_PORT || "localhost"
const apiPort = process.env.API_PORT || "3333";

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
	stations: IStation[]

	getStationData() {
		return this.stations;
	}

	async initStationsFromDB() {
		try {
			const response = await fetch(`http://${apiHost}:${apiPort}/stations`);
			const jsonData = await response.json();

			if(!jsonData.error){
				this.stations = jsonData.data as IStation[];
				return;
			} 

			throw new Error(jsonData.error.message)

		} catch (error) {
			throw new Error(error)
		} 
	}

	/**
	 * Fetches all saved stations from local storage.
	 * @returns An array of saved stations.
	 */
	async fetchSavedStations() {
		try {
			const timestamp = new Date().getTime();
			const response = await fetch(`/api/station-networks?_=${timestamp}`);
			const data = await response.json();

			if(!data.error){
				return data as IStation[];
			} 

			throw new Error(data.error.message)

		} catch (error) {
			throw new Error(error)
		}
	}

	async initStations() {
		try {
			const newSeismograms: Map<string, Seismogram> = new Map([]);
			const enabled_seismograms = (await IndexedDB.read(
				"seismograms",
				"enabled_seismograms"
			)) as string[] | null;

			if (!this.stations) {
				const indexStation = (await IndexedDB.read("stations", "stations")) as IStation[];
				const expiry = (await IndexedDB.read("stations", "expiry") ?? Date.now() - 5 * 1000) as number;
				
				if (!indexStation || expiry <= Date.now()) {
					console.log("Pulling station data from database...")
					await this.initStationsFromDB()
					await IndexedDB.write({
						objectStore: "stations",
						keyPath: "stations",
						key: "stations",
						data: this.stations
					});

					const expirySeconds = 60;
					await IndexedDB.write({
						objectStore: "stations",
						keyPath: "stations",
						key: "expiry",
						data: Date.now() + (expirySeconds * 1000)
					});

					await IndexedDB.write({
						objectStore: "seismograms",
						keyPath: "type",
						key: "enabled_seismograms",
						data: this.stations.map((s) => s.code),
					});
					console.log("Done!")
				} else {
					console.log("Expired at: " + new Date(expiry))
					this.stations = indexStation
				}
			}

			// if both enabled_seismograms and disabled_seismograms are null,
			// then save the default stations to indexedDB enabled_seismograms
			if (!enabled_seismograms) {
				await IndexedDB.write({
					objectStore: "seismograms",
					keyPath: "type",
					key: "enabled_seismograms",
					data: this.stations.map((s) => s.code),
				});
			}

			if (enabled_seismograms) {
				for (let station of enabled_seismograms) {
					newSeismograms.set(station, new Seismogram(station));
				}
			}

			return newSeismograms;
		} catch (error) {
			throw new Error(error);
		}
	}

	async enableStation(station: string, seismograms: Map<string, Seismogram>) {
		try {
			const newSeismograms: Map<string, Seismogram> = seismograms;
			const db_enabled_seismograms = (await IndexedDB.read(
				"seismograms",
				"enabled_seismograms"
			)) as string[] | null;

			const current_enabled_seismograms = db_enabled_seismograms || [];

			// add to indexedDB
			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "enabled_seismograms",
				data: [...current_enabled_seismograms, station],
			});

			newSeismograms.set(station, new Seismogram(station));
			return newSeismograms;
		} catch (error) {
			throw new Error(error);
		}
	}

	async enableAllStations() {
		try {
			const newSeismograms: Map<string, Seismogram> = new Map([]);
			// add to indexedDB
			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "enabled_seismograms",
				data: this.stations.map((s) => s.code),
			});

			for (let station of this.stations) {
				newSeismograms.set(station.code, new Seismogram(station.code));
			}

			return newSeismograms;
		} catch (error) {
			throw new Error(error);
		}
	}

	async disableStation(station: string, seismograms: Map<string, Seismogram>) {
		try {
			const newSeismograms: Map<string, Seismogram> = seismograms;
			// remove from indexedDB
			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "enabled_seismograms",
				data: [...newSeismograms.keys()].filter((s) => s !== station),
			});

			newSeismograms.delete(station);

			return newSeismograms;
		} catch (error) {
			throw new Error(error);
		}
	}
}

export default Station;
