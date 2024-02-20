import { IEarthquakeDetection, ISeismogram } from "@/entities/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";

export default class EarthquakeDetection implements IEarthquakeDetection {
	title: string;
	description: string;
	detection: string;
	station: string;
	time_stamp: number = 0;
	depth: number;
	lat: number;
	long: number;
	mag: number;
	countdown: number;
	location: string;

	constructor(earthquakeDetection?: IEarthquakeDetection) {
		if (earthquakeDetection) {
			this.title = earthquakeDetection.title;
			this.description = earthquakeDetection.description;
			this.detection = earthquakeDetection.detection;
			this.time_stamp = earthquakeDetection.time_stamp;
			this.depth = earthquakeDetection.depth;
			this.lat = earthquakeDetection.lat;
			this.long = earthquakeDetection.long;
			this.mag = earthquakeDetection.mag;
			this.countdown = earthquakeDetection.countdown;
			this.station = earthquakeDetection.station;
			this.location = earthquakeDetection.location;
		}

		makeObservable(this, {
			time_stamp: observable,
			setEarthquakeDetection: action,
			setStatusDetection: action,
		} as AnnotationsMap<this, any>);
	}

	setEarthquakeDetection(earthquakeDetection: IEarthquakeDetection) {
		this.title = earthquakeDetection.title;
		this.description = earthquakeDetection.description;
		this.detection = earthquakeDetection.detection;
		this.depth = earthquakeDetection.depth;
		this.lat = earthquakeDetection.lat;
		this.long = earthquakeDetection.long;
		this.mag = earthquakeDetection.mag;
		this.countdown = earthquakeDetection.countdown;
		this.station = earthquakeDetection.station;
		this.location = earthquakeDetection.location;
		this.time_stamp = earthquakeDetection.time_stamp;
	}

	setStatusDetection(title: string, description: string, detection: string, countdown: number) {
		this.title = title;
		this.description = description;
		this.detection = detection;
		this.countdown = countdown;
	}

	streamEarthquakeDetection(earthquakeDetectionWorker: Worker, mode: string = "realtime") {
		earthquakeDetectionWorker.postMessage({
			mode: mode,
		});

		earthquakeDetectionWorker.onmessage = async (event: MessageEvent) => {
			const { data } = event;
			const date = new Date(data.time_stamp);
			const offset = new Date().getTimezoneOffset() * 60 * 1000;
			date.setTime(date.getTime() - offset);

			const earthquakeDetection: IEarthquakeDetection = {
				title: "Terdeteksi Gelombang P",
				description: `Harap perhatian, muncul deteksi gelombang P di stasiun ${data.station}`,
				time_stamp: date.getTime(),
				depth: data.depth,
				lat: data.lat,
				long: data.long,
				mag: data.mag,
				detection: "warning",
				countdown: 10,
				station: data.station,
				location: data.location,
			};

			this.setEarthquakeDetection(earthquakeDetection);
		};
	}

	async fetchLatestEarthquakeDetection() {
		const time_stamp = new Date().getTime();
		let start_date = time_stamp - 1 * 24 * 60 * 60 * 1000;
		let end_date = time_stamp;

		// to unix
		start_date = Math.floor(start_date);
		end_date = Math.floor(end_date);

		const response = await this.fetchHistoryEarthquakeDetection(
			start_date,
			end_date
		);

		if (response.length) return response[0];

		throw new Error("No earthquake detection found");
	}

	async fetchHistoryEarthquakeDetection(start_date: number, end_date: number) {
		try {
			const url = `http://localhost:3333/history?start_date=${start_date}&end_date=${end_date}&limit=20`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.error) throw new Error(data.error);

			return data;
		} catch (error) {
			throw error;
		}
	}

	async exportHistoryEarthquakeDetection(
		start_date: number,
		end_date: number
	) {
		try {
			// ubah milliseconds menjadi format unix
			start_date = Math.floor(start_date);
			end_date = Math.floor(end_date);
			const url = `http://localhost:3333/export?start_date=${start_date}&end_date=${end_date}`;

			const response = await fetch(url);

			// status
			if (!response.ok) {
				throw new Error("Terjadi kesalahan ketika mengunduh file");
			}

			// text/csv
			const data = await response.blob();
			const urlBlob = URL.createObjectURL(data);
			const link = document.createElement("a");
			link.href = urlBlob;
			let date = new Date();
			link.download = `history-tews-${date.getTime()}.csv`;
			link.click();
		} catch (error) {
			throw error;
		}
	}
}
