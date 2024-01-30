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

	async initStations() {
		const newSeismograms = await this.station.initStations();
		if (newSeismograms) {
			this.seismograms = new Map(newSeismograms);
		}
	}

	async enableStation(station: string) {
		const newSeismograms = await this.station.enableStation(
			station,
			this.seismograms
		);
		if (newSeismograms) {
			this.seismograms = new Map(newSeismograms);
		}
	}

	async enableAllStation() {
		const newSeismograms = await this.station.enableAllStation();
		if (newSeismograms) {
			this.seismograms = new Map(newSeismograms);
		}
	}

	async disableStation(station: string) {
		const newSeismograms = await this.station.disableStation(
			station,
			this.seismograms
		);
		if (newSeismograms) {
			this.seismograms = new Map(newSeismograms);
		}
	}

	/**
	 * Displays the seismogram of a station.
	 * @param seismogram - The seismogram to display.
	 */
	async connectAllSeismogram(mode: string) {
		if (this.seismograms.size === 0) {
			await this.initStations();
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
