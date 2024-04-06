import { ISeismogram } from "@/entities/_index";
import { SeismogramDataType } from "@/workers/seismogram";
import { makeObservable, observable } from "mobx";

const MAX_INT = 2147483647;

// Get API host
const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost"
const apiPort = process.env.NEXT_PUBLIC_API_PORT || "3333";

export default class Seismogram implements ISeismogram {
	creation_date: number;
	z_channel: number;
	n_channel: number;
	e_channel: number;
	station: string;

	handlerSeismogramData: (event: MessageEvent) => void;
	seismogramData: SeismogramDataType = {
		channelZ: [],
		channelN: [],
		channelE: [],
		pWaves: [],
		currentIndex: 0,
	};
	rerender: number = 0;
	constructor(station?: string) {
		if (station) {
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
			type: "seismogram",
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

	restartSeismogram(seismogramWorker: Worker, mode: string) {
		seismogramWorker.postMessage({
			station: this.station,
			message: "restart",
			mode: mode,
			type: "seismogram",
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
			type: "seismogram",
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
			type: "seismogram",
		});
	}

	stopSeismogram(seismogramWorker: Worker) {
		seismogramWorker.postMessage({
			station: this.station,
			message: "stop",
			type: "seismogram",
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
			const url = `${apiHost}:${apiPort}/waves?station=${station}&start_date=${start_date}&end_date=${end_date}`;

			const response = await fetch(url);

			let data = await response.json();

			if (data.error) throw new Error(data.error);

			const seismogram = [] as ISeismogram[];

			for (const obj of Object.entries(data) as any) {
				const key = obj[0];
				const dataValue = obj[1];
				// const offset = - (new Date().getTimezoneOffset() * 60 * 1000);
				const date = new Date(parseInt(key));
				// date.setTime(date.getTime() - offset);
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
