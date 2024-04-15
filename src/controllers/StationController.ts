import {
	AnnotationsMap,
	action,
	intercept,
	makeObservable,
	observable,
	observe,
} from "mobx";
import { Seismogram, Station } from "@/models/_index";
import { IStation } from "@/entities/_index";
import toast from "react-hot-toast";

/**
 * The StationController class handles the logic for managing stations.
 */
class StationController {
	private static instance: StationController;
	private station = new Station();
	seismogramWorker: Worker;
	enabledSeismograms: Map<string, Seismogram> = new Map([]);
	disabledSeismograms: Map<string, Seismogram> = new Map([]);

	private constructor() {
		makeObservable(this, {
			enabledSeismograms: observable,
			disabledSeismograms: observable,
			getStations: action,
			initStations: action,
			enableStation: action,
			enableAllStations: action,
			disableStation: action,
			connectSeismogram: action,
			connectAllSeismogram: action,
			disconnectAllSeismogram: action,
			disconnectSeismogram: action,
		} as AnnotationsMap<this, any>);
		this.seismogramWorker = new Worker(
			new URL("../workers/seismogram.ts", import.meta.url)
		);
	}

	public static getInstance(): StationController {
		if (!StationController.instance) {
			StationController.instance = new StationController();
		}
		return StationController.instance;
	}

	/**
	 * Retrieves all the saved stations.
	 * @returns An array of IStation objects representing the saved stations.
	 */
	async getStations(): Promise<IStation[]> {
		try {
			if (
				this.enabledSeismograms.size === 0 &&
				this.disabledSeismograms.size === 0
			) {
				await this.initStations();
			}

			const stations = await this.station.fetchSavedStations();
			const result = stations.filter((station) => {
				return this.enabledSeismograms.has(station.code);
			});
			return result;
		} catch (error) {
			return [];
		}
	}

	async getDBStation() {
		if (this.enabledSeismograms.size === 0 && this.disabledSeismograms.size === 0) {
			await this.initStations();
		}
	
		return this.station.getStationData();
	}

	async initStations() {
		try {
			const newSeismograms = await this.station.initStations();
			if (newSeismograms) {
				this.enabledSeismograms = new Map(newSeismograms.enabledSeismograms);
				this.disabledSeismograms = new Map(newSeismograms.disabledSeismograms);
			}
		} catch (error) {
			this.displayError(`${error}`);
		}
	}

	async enableStation(station: string, mode: string) {
		try {
			const newSeismograms = await this.station.enableStation(
				station,
				this.enabledSeismograms,
				this.disabledSeismograms
			);
			if (newSeismograms) {
				this.disabledSeismograms
					.get(station)
					?.stopSeismogram(this.seismogramWorker);
				this.enabledSeismograms = new Map(newSeismograms.enabledSeismograms);
				this.disabledSeismograms = new Map(newSeismograms.disabledSeismograms);
				this.enabledSeismograms
					.get(station)
					?.restartSeismogram(this.seismogramWorker, mode);
			}
			toast.success(`Stasiun ${station} telah diaktifkan`);
		} catch (error) {
			this.displayError(`${error}`);
		}
	}

	async enableAllStations(mode: string) {
		try {
			const newSeismograms = await this.station.enableAllStations();
			if (newSeismograms) {
				this.enabledSeismograms = new Map(newSeismograms.enabledSeismograms);
				this.disabledSeismograms = new Map(newSeismograms.disabledSeismograms);
				for (const seismogram of this.enabledSeismograms.values()) {
					seismogram.restartSeismogram(this.seismogramWorker, mode);
				}
				toast.success("Semua stasiun telah diaktifkan");
			}
		} catch (error) {
			this.displayError(`${error}`);
		}
	}

	async disableStation(station: string, mode: string) {
		try {
			const newSeismograms = await this.station.disableStation(
				station,
				this.enabledSeismograms,
				this.disabledSeismograms
			);
			if (newSeismograms) {
				this.enabledSeismograms
					.get(station)
					?.stopSeismogram(this.seismogramWorker);
				this.enabledSeismograms = new Map(newSeismograms.enabledSeismograms);
				this.disabledSeismograms = new Map(newSeismograms.disabledSeismograms);
				this.disabledSeismograms
					.get(station)
					?.restartSeismogram(this.seismogramWorker, mode);
				toast.success(`Stasiun ${station} telah dinonaktifkan`);
			}
		} catch (error) {
			this.displayError(`${error}`);
		}
	}

	/**
	 * Displays the seismogram of a station.
	 * @param seismogram - The seismogram to display.
	 */
	async connectAllSeismogram(mode: string) {
		if (
			this.enabledSeismograms.size === 0 &&
			this.disabledSeismograms.size === 0
		) {
			await this.initStations();
		}
		for (const seismogram of this.enabledSeismograms.values()) {
			seismogram.streamSeismogram(this.seismogramWorker, mode);
		}
		for (const seismogram of this.disabledSeismograms.values()) {
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
		if (this.enabledSeismograms.has(station)) {
			this.enabledSeismograms
				.get(station)
				?.streamSeismogram(this.seismogramWorker, mode);
		} else if (this.disabledSeismograms.has(station)) {
			this.disabledSeismograms
				.get(station)
				?.streamSeismogram(this.seismogramWorker, mode);
		}
	}

	getLastSeismogramData(station: string) {
		if (this.enabledSeismograms.has(station)) {
			this.enabledSeismograms
				.get(station)
				?.getLastSeismogramData(this.seismogramWorker);
		} else if (this.disabledSeismograms.has(station)) {
			this.disabledSeismograms
				.get(station)
				?.getLastSeismogramData(this.seismogramWorker);
		}
	}

	getHistorySeismogramData(station: string, start: number, end: number) {
		if (this.enabledSeismograms.has(station)) {
			this.enabledSeismograms
				.get(station)
				?.getHistorySeismogramData(this.seismogramWorker, start, end);
		} else if (this.disabledSeismograms.has(station)) {
			this.disabledSeismograms
				.get(station)
				?.getHistorySeismogramData(this.seismogramWorker, start, end);
		}
	}

	/**
	 * stop the seismogram worker.
	 */
	disconnectAllSeismogram() {
		for (const seismogram of this.enabledSeismograms.values()) {
			seismogram.stopSeismogram(this.seismogramWorker);
		}
		for (const seismogram of this.disabledSeismograms.values()) {
			seismogram.stopSeismogram(this.seismogramWorker);
		}
	}

	/**
	 * stop the seismogram worker.
	 * @param station - The station of the seismogram.
	 */
	disconnectSeismogram(station: string) {
		if (this.enabledSeismograms.has(station)) {
			this.enabledSeismograms
				.get(station)
				?.stopSeismogram(this.seismogramWorker);
		} else if (this.disabledSeismograms.has(station)) {
			this.disabledSeismograms
				.get(station)
				?.stopSeismogram(this.seismogramWorker);
		}
	}

	displayError(error: string) {
		toast.error(error);
	}
}

export default StationController;
