import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import { Seismogram, Station } from "@/models/_index";
import { ISeismogram, IStation } from "@/entities/_index";

/**
 * The StationController class handles the logic for managing stations.
 */
class StationController {
	private station = new Station();
	private seismogramBBJI = new Seismogram("BBJI");
	private seismogramSMRI = new Seismogram("SMRI");
	private seismogramJAGI = new Seismogram("JAGI");
	private seismogramUGM = new Seismogram("UGM");
	private seismogramBKB = new Seismogram("BKB");
	private seismogramCISI = new Seismogram("CISI");
	private seismogramGSI = new Seismogram("GSI");
	private seismogramBKNI = new Seismogram("BKNI");
	private seismogramPMBI = new Seismogram("PMBI");
	private seismogramLHMI = new Seismogram("LHMI");
	private seismogramMNAI = new Seismogram("MNAI");
	private seismogramPLAI = new Seismogram("PLAI");
	private seismogramMMRI = new Seismogram("MMRI");
	private seismogramSOEI = new Seismogram("SOEI");
	private seismogramLUWI = new Seismogram("LUWI");
	private seismogramSAUI = new Seismogram("SAUI");
	private seismogramTOLI = new Seismogram("TOLI");
	private seismogramSANI = new Seismogram("SANI");
	private seismogramBNDI = new Seismogram("BNDI");
	private seismogramFAKI = new Seismogram("FAKI");
	private seismogramGENI = new Seismogram("GENI");
	private seismogramTNTI = new Seismogram("TNTI");
	private seismogramWorker: Worker;

	constructor(seismogramWorker: Worker) {
		makeObservable(this, {
			station: observable,
			getStations: action,
			getStationByCode: action,
			connectSeismogram: action,
			disconnectSeismogram: action,
		} as AnnotationsMap<this, any>);

		this.seismogramWorker = seismogramWorker;
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

	/**
	 * Displays the seismogram of a station.
	 * @param seismogram - The seismogram to display.
	 */
	connectSeismogram() {
		this.seismogramBBJI.streamSeismogram(this.seismogramWorker);
		this.seismogramSMRI.streamSeismogram(this.seismogramWorker);
		this.seismogramJAGI.streamSeismogram(this.seismogramWorker);
		this.seismogramUGM.streamSeismogram(this.seismogramWorker);
		this.seismogramBKB.streamSeismogram(this.seismogramWorker);
		this.seismogramCISI.streamSeismogram(this.seismogramWorker);
		this.seismogramGSI.streamSeismogram(this.seismogramWorker);
		this.seismogramBKNI.streamSeismogram(this.seismogramWorker);
		this.seismogramPMBI.streamSeismogram(this.seismogramWorker);
		this.seismogramLHMI.streamSeismogram(this.seismogramWorker);
		this.seismogramMNAI.streamSeismogram(this.seismogramWorker);
		this.seismogramPLAI.streamSeismogram(this.seismogramWorker);
		this.seismogramMMRI.streamSeismogram(this.seismogramWorker);
		this.seismogramSOEI.streamSeismogram(this.seismogramWorker);
		this.seismogramLUWI.streamSeismogram(this.seismogramWorker);
		this.seismogramSAUI.streamSeismogram(this.seismogramWorker);
		this.seismogramTOLI.streamSeismogram(this.seismogramWorker);
		this.seismogramSANI.streamSeismogram(this.seismogramWorker);
		this.seismogramBNDI.streamSeismogram(this.seismogramWorker);
		this.seismogramFAKI.streamSeismogram(this.seismogramWorker);
		this.seismogramGENI.streamSeismogram(this.seismogramWorker);
		this.seismogramTNTI.streamSeismogram(this.seismogramWorker);
	}

	/**
	 * stop the seismogram worker.
	 */
	disconnectSeismogram() {
		this.seismogramBBJI.stopSeismogram(this.seismogramWorker);
		this.seismogramSMRI.stopSeismogram(this.seismogramWorker);
		this.seismogramJAGI.stopSeismogram(this.seismogramWorker);
		this.seismogramUGM.stopSeismogram(this.seismogramWorker);
		this.seismogramBKB.stopSeismogram(this.seismogramWorker);
		this.seismogramCISI.stopSeismogram(this.seismogramWorker);
		this.seismogramGSI.stopSeismogram(this.seismogramWorker);
		this.seismogramBKNI.stopSeismogram(this.seismogramWorker);
		this.seismogramPMBI.stopSeismogram(this.seismogramWorker);
		this.seismogramLHMI.stopSeismogram(this.seismogramWorker);
		this.seismogramMNAI.stopSeismogram(this.seismogramWorker);
		this.seismogramPLAI.stopSeismogram(this.seismogramWorker);
		this.seismogramMMRI.stopSeismogram(this.seismogramWorker);
		this.seismogramSOEI.stopSeismogram(this.seismogramWorker);
		this.seismogramLUWI.stopSeismogram(this.seismogramWorker);
		this.seismogramSAUI.stopSeismogram(this.seismogramWorker);
		this.seismogramTOLI.stopSeismogram(this.seismogramWorker);
		this.seismogramSANI.stopSeismogram(this.seismogramWorker);
		this.seismogramBNDI.stopSeismogram(this.seismogramWorker);
		this.seismogramFAKI.stopSeismogram(this.seismogramWorker);
		this.seismogramGENI.stopSeismogram(this.seismogramWorker);
		this.seismogramTNTI.stopSeismogram(this.seismogramWorker);
	}
}

export default StationController;
