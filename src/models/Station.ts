import STATIONS_DATA from "@/assets/data/stations_testing.json";
import { IStation } from "@/entities/_index";
import Seismogram from "./Seismogram";
import IndexedDB from "@/lib/IndexedDB";

// let stations = [] as IStation[];

/**
 * Represents a Station.
 */
// Get API host
const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost"
const apiPort = process.env.NEXT_PUBLIC_API_PORT || "3333";

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
			const response = await fetch(`${apiHost}:${apiPort}/stations`);
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
			const enabledSeismograms: Map<string, Seismogram> = new Map([]);
			const disabledSeismograms: Map<string, Seismogram> = new Map([]);

			const enabled_seismograms = (await IndexedDB.read(
				"seismograms",
				"enabled_seismograms"
			)) as string[] | null;
			const disabled_seismograms = (await IndexedDB.read(
				"seismograms",
				"disabled_seismograms"
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

			// if disabled_seismograms is null, save an empty array to indexedDB disabled_seismograms
			if (!disabled_seismograms) {
				await IndexedDB.write({
					objectStore: "seismograms",
					keyPath: "type",
					key: "disabled_seismograms",
					data: [],
				});
			}

			if (enabled_seismograms) {
				for (let station of enabled_seismograms) {
					enabledSeismograms.set(station, new Seismogram(station));
				}
			}

			if (disabled_seismograms) {
				for (let station of disabled_seismograms) {
					disabledSeismograms.set(station, new Seismogram(station));
				}
			}

			return {
				enabledSeismograms,
				disabledSeismograms,
			};
		} catch (error) {
			throw new Error(error);
		}
	}

	async enableStation(station: string, enabledSeismograms: Map<string, Seismogram>, disabledSeismograms: Map<string, Seismogram>) {
		try {
			// add to indexedDB
			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "enabled_seismograms",
				data: [...enabledSeismograms.keys(), station],
			});

			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "disabled_seismograms",
				data: [...disabledSeismograms.keys()].filter((s) => s !== station),
			});

			enabledSeismograms.set(station, new Seismogram(station));
			disabledSeismograms.delete(station);
			
			return {
				enabledSeismograms,
				disabledSeismograms,
			}
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

			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "disabled_seismograms",
				data: [],
			});

			for (let station of this.stations) {
				newSeismograms.set(station.code, new Seismogram(station.code));
			}

			return {
				enabledSeismograms: newSeismograms,
				disabledSeismograms: new Map([]) as Map<string, Seismogram>
			}
		} catch (error) {
			throw new Error(error);
		}
	}

	async disableStation(station: string, enabledSeismograms: Map<string, Seismogram>, disabledSeismograms: Map<string, Seismogram>) {
		try {
			// add to indexedDB
			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "disabled_seismograms",
				data: [...disabledSeismograms.keys(), station],
			});

			// remove from indexedDB
			await IndexedDB.write({
				objectStore: "seismograms",
				keyPath: "type",
				key: "enabled_seismograms",
				data: [...enabledSeismograms.keys()].filter((s) => s !== station),
			});

			disabledSeismograms.set(station, new Seismogram(station));
			enabledSeismograms.delete(station);

			return {
				enabledSeismograms,
				disabledSeismograms,
			}
		} catch (error) {
			throw new Error(error);
		}
	}
}

export default Station;
