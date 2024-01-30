import { IEarthquakeDetection, ISeismogram } from "@/entities/_index";

export default class EarthquakeDetection implements IEarthquakeDetection {
	title: string;
	description: string;
	detection: string;
	station: string;
	time_stamp: number;
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
			// ubah milliseconds menjadi format unix
			start_date = Math.floor(start_date);
			end_date = Math.floor(end_date);
			const url = `http://localhost:3333/history?start_date=${start_date}&end_date=${end_date}`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.error) throw new Error(data.error);

			return Object.values(data) as IEarthquakeDetection[];
		} catch (error) {
			throw error;
		}
	}

	async fetchSeismogramEarthquakeDetection(
		station: string,
		start_date: number,
		end_date: number
	) {
		try {
			// to unix
			start_date = Math.floor(start_date);
			end_date = Math.floor(end_date);
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
