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
import STATIONS_DATA from "@/assets/data/stations.json";

/**
 * The StationController class handles the logic for managing stations.
 */
class StationController {
	private static instance: StationController;
	private station = new Station();
	seismogramWorker: Worker;
	seismograms: Map<string, Seismogram> = new Map([]);

	private constructor() {
		makeObservable(this, {
			seismograms: observable,
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
			if (this.seismograms.size === 0) {
				await this.initStations();
			}

			const stations = await this.station.fetchSavedStations();
			const result = stations.filter((station) => {
				return this.seismograms.has(station.code);
			});
			return result;
		} catch (error) {
			return [];
		}
	}

	async getDBStation() {
		if (this.seismograms.size === 0) {
			await this.initStations();
		}
	
		return this.station.getStationData();
	}

	async initStations() {
		try {
			const newSeismograms = await this.station.initStations();
			if (newSeismograms) {
				this.seismograms = new Map(newSeismograms);
			}
		} catch (error) {
			this.displayError(error);
		}
	}

	async enableStation(station: string) {
		try {
			const newSeismograms = await this.station.enableStation(
				station,
				this.seismograms
			);
			if (newSeismograms) {
				this.seismograms = new Map(newSeismograms);
				toast.success(`Stasiun ${station} telah diaktifkan`);
			}
		} catch (error) {
			this.displayError(error);
		}
	}

	async enableAllStations() {
		try {
			const newSeismograms = await this.station.enableAllStations();
			if (newSeismograms) {
				this.seismograms = new Map(newSeismograms);
				toast.success("Semua stasiun telah diaktifkan");
			}
		} catch (error) {
			this.displayError(error);
		}
	}

	async disableStation(station: string) {
		try {
			const newSeismograms = await this.station.disableStation(
				station,
				this.seismograms
			);
			if (newSeismograms) {
				this.seismograms = new Map(newSeismograms);
				toast.success(`Stasiun ${station} telah dinonaktifkan`);
			}
		} catch (error) {
			this.displayError(error);
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
		const seismogram = this.seismograms.get(station);
		if (seismogram) {
			seismogram.streamSeismogram(this.seismogramWorker, mode);
		}
	}

	getLastSeismogramData(station: string) {
		this.seismograms.get(station)?.getLastSeismogramData(this.seismogramWorker);
	}

	getHistorySeismogramData(station: string, start: number, end: number) {
		this.seismograms
			.get(station)
			?.getHistorySeismogramData(this.seismogramWorker, start, end);
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

	displayError(error: string) {
		toast.error(error);
	}
}

export default StationController;
