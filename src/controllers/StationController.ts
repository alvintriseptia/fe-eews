import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import { Seismogram, Station } from "@/models/_index";
import { IStation } from "@/entities/_index";

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
	async getStations(): Promise<IStation[]> {
		return await this.station.fetchSavedStations();
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
		const newSeismograms = await this.station.initSeismogram();
		this.seismograms = new Map(newSeismograms);
	}

	async enableSeismogram(station: string) {
		const newSeismograms = await this.station.enableSeismogram(station, this.seismograms);
		this.seismograms = new Map(newSeismograms);
	}

	async enableAllSeismogram() {
		const newSeismograms = await this.station.enableAllSeismogram();
		this.seismograms = new Map(newSeismograms);
	}

	async disableSeismogram(station: string) {
		const newSeismograms = await this.station.disableSeismogram(station, this.seismograms);
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
