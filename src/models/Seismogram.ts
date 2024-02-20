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
	constructor(station?: string) {
		if(station) {
			this.station = station;
		}

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

	async fetchSeismogramEarthquakeDetection(
		station: string,
		start_date: number,
		end_date: number
	) {
		try {
			// to unix
			start_date = start_date;
			end_date = end_date;
			const url = `http://localhost:3333/waves?station=${station}&start_date=${start_date}&end_date=${end_date}`;

			const response = await fetch(url);

			let data = await response.json();

			if (data.error) throw new Error(data.error);

			const seismogram = [] as ISeismogram[];

			for (const obj of Object.entries(data) as any) {
				const key = obj[0];
				const dataValue = obj[1];
				const offset = - (new Date().getTimezoneOffset() * 60 * 1000);
				const date = new Date(parseInt(key));
				date.setTime(date.getTime() - offset);
				const seismogramData = {
					creation_date: date.getTime(),
					z_channel: dataValue.Z,
					n_channel: dataValue.N,
					e_channel: dataValue.E,
				} as ISeismogram;

				seismogram.push(seismogramData);
			}


			return seismogram;
		} catch (error) {
			throw error;
		}
	}
}
