import { ISeismogram } from "@/entities/_index";
import { SeismogramDataType } from "@/workers/seismogram";
import { makeObservable, observable } from "mobx";

const MAX_INT = 2147483647;

export default class Seismogram implements ISeismogram {
	creation_date: number;
	z_channel: number;
	n_channel: number;
	e_channel: number;
	station: string;

	handlerSeismogramData: (event: MessageEvent) => void;
	seismogramData: SeismogramDataType = {
		channelZ: {
			x: [],
			y: [],
		},
		channelN: {
			x: [],
			y: [],
		},
		channelE: {
			x: [],
			y: [],
		},
		pWaves: [],
		currentIndex: 0,
	};
	rerender: number = 0;
	constructor(station: string) {
		this.station = station;

		makeObservable(this, {
			rerender: observable,
		});
	}

	streamSeismogram(seismogramWorker: Worker, mode: string) {
		seismogramWorker.postMessage({
			station: this.station,
			message: "stream",
			mode: mode,
		});

		this.handlerSeismogramData = (event) => {
			const data = event.data;
			if (data.station === this.station) {
				this.seismogramData = data.data;
				if (this.rerender + 1 < MAX_INT) {
					this.rerender++;
				} else {
					this.rerender = 0;
				}
			}
		};

		seismogramWorker.addEventListener("message", this.handlerSeismogramData);
	}

	getLastSeismogramData(seismogramWorker: Worker) {
		seismogramWorker.postMessage({
			station: this.station,
			message: "lastData",
		});
	}

	getHistorySeismogramData(
		seismogramWorker: Worker,
		start: number,
		end: number
	) {
		seismogramWorker.postMessage({
			station: this.station,
			message: "history",
			start_date: start,
			end_date: end,
		});
	}

	stopSeismogram(seismogramWorker: Worker) {
		seismogramWorker.postMessage({
			station: this.station,
			message: "stop",
		});

		seismogramWorker.removeEventListener("message", this.handlerSeismogramData);
	}
}
