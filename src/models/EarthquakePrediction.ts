import { IEarthquakePrediction, ISeismogram } from "@/entities/_index";

export default class EarthquakePrediction implements IEarthquakePrediction {
	title: string;
	description: string;
	prediction: string;
	station: string;
	time_stamp: number;
	depth: number;
	lat: number;
	long: number;
	mag: number;
	countdown: number;
	location: string;

	constructor(earthquakePrediction?: IEarthquakePrediction) {
		if (earthquakePrediction) {
			this.title = earthquakePrediction.title;
			this.description = earthquakePrediction.description;
			this.prediction = earthquakePrediction.prediction;
			this.time_stamp = earthquakePrediction.time_stamp;
			this.depth = earthquakePrediction.depth;
			this.lat = earthquakePrediction.lat;
			this.long = earthquakePrediction.long;
			this.mag = earthquakePrediction.mag;
			this.countdown = earthquakePrediction.countdown;
			this.station = earthquakePrediction.station;
			this.location = earthquakePrediction.location;
		}
	}

	async fetchLatestEarthquakePrediction() {
		const time_stamp = new Date().getTime();
		let start_date = time_stamp - 1 * 24 * 60 * 60 * 1000;
		let end_date = time_stamp;

		// to unix
		start_date = Math.floor(start_date / 1000);
		end_date = Math.floor(end_date / 1000);

		const response = await this.fetchHistoryEarthquakePrediction(
			start_date,
			end_date
		);

		if (response.length) return response[0];

		throw new Error("No earthquake prediction found");
	}

	async fetchHistoryEarthquakePrediction(start_date: number, end_date: number) {
		try {
			// ubah milliseconds menjadi format unix
			start_date = Math.floor(start_date / 1000);
			end_date = Math.floor(end_date / 1000);
			const url = `http://localhost:3333/history?start_date=${start_date}&end_date=${end_date}`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.error) throw new Error(data.error);

			return Object.values(data) as IEarthquakePrediction[];
		} catch (error) {
			throw error;
		}
	}

	async fetchSeismogramEarthquakePrediction(
		station: string,
		start_date: number,
		end_date: number
	) {
		try {
			// to unix
			start_date = Math.floor(start_date / 1000);
			end_date = Math.floor(end_date / 1000);
			console.log(start_date, end_date)
			const url = `http://localhost:3333/waves?station=${station}&start_date=${start_date}&end_date=${end_date}`;

			const response = await fetch(url);

			let data = await response.json();

			if (data.error) throw new Error(data.error);

			const seismogram = [] as ISeismogram[];

			for (const obj of Object.entries(data) as any) {
				const key = obj[0];
				const dataValue = obj[1];
				const seismogramData = {
					creation_date: new Date(key * 1000).getTime(),
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
