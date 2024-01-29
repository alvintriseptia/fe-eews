import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import { Seismogram, Station } from "@/models/_index";
import { ISeismogram, IStation } from "@/entities/_index";
import STATIONS_DATA from "@/assets/data/stations.json";
import * as indexedDB from "@/lib/indexed-db";

const stations = STATIONS_DATA as IStation[];

/**
 * The StationController class handles the logic for managing stations.
 */
class StationController {
	private station = new Station();
	private seismogramWorker: Worker;
	seismograms: Map<string, Seismogram> = new Map([]);

	constructor(seismogramWorker?: Worker) {
		makeObservable(this, {
			station: observable,
			seismograms: observable,
			getStations: action,
			getStationByCode: action,
			initSeismogram: action,
			connectAllSeismogram: action,
			disconnectAllSeismogram: action,
		} as AnnotationsMap<this, any>);

		if (seismogramWorker) {
			this.seismogramWorker = seismogramWorker;
		}
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

	async initSeismogram() {
		let newSeismograms = this.seismograms;
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

			this.seismograms = new Map(newSeismograms);
		}
	}

	async enableSeismogram(station: string) {
		let newSeismograms = this.seismograms;
		// add to indexedDB
		await indexedDB.writeToIndexedDB({
			objectStore: "seismograms",
			keyPath: "type",
			key: "enabled_seismograms",
			data: [...this.seismograms.keys(), station],
		});

		newSeismograms.set(station, new Seismogram(station));
		this.seismograms = new Map(newSeismograms);
	}

	async enableAllSeismogram() {
		let newSeismograms = this.seismograms;
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

		this.seismograms = new Map(newSeismograms);
	}

	async disableSeismogram(station: string) {
		let newSeismograms = this.seismograms;
		// remove from indexedDB
		await indexedDB.writeToIndexedDB({
			objectStore: "seismograms",
			keyPath: "type",
			key: "enabled_seismograms",
			data: [...newSeismograms.keys()].filter((s) => s !== station),
		});

		newSeismograms.delete(station);
		this.seismograms = new Map(newSeismograms);
	}

	/**
	 * Displays the seismogram of a station.
	 * @param seismogram - The seismogram to display.
	 */
	async connectAllSeismogram(mode: string) {
		if (this.seismograms.size === 0) {
			await this.initSeismogram();
		}
		console.log(this.seismograms);
		for (const seismogram of this.seismograms.values()) {
			seismogram.streamSeismogram(this.seismogramWorker, mode);
		}
	}

	/**
	 * Displays the seismogram of a station.
	 * @param seismogram - The seismogram to display.
	 * @param mode - The mode of the seismogram.
	 * @param station - The station of the seismogram.
	 */
	connectSeismogram(mode: string, station: string) {
		this.seismograms
			.get(station)
			?.streamSeismogram(this.seismogramWorker, mode);
	}

	/**
	 * stop the seismogram worker.
	 */
	disconnectAllSeismogram() {
		for (const seismogram of this.seismograms.values()) {
			seismogram.stopSeismogram(this.seismogramWorker);
		}
	}

	/**
	 * stop the seismogram worker.
	 * @param station - The station of the seismogram.
	 */
	disconnectSeismogram(station: string) {
		this.seismograms.get(station)?.stopSeismogram(this.seismogramWorker);
	}
}

export default StationController;
