import { IEarthquakeHistory } from "@/entities/_index";
import {
	ResponseLatestFeltEarthquake,
	ResponseLatestEarthquake,
	ResponseEarthquakeWeekly,
} from "@/models/response/_index";

export default class EarthquakeHistory implements IEarthquakeHistory {
	id: string;
	title: string;
	location: string;
	date: string;
	time: string;
	station: string;
	magnitude: string;
	depth: string;
	latitude: string;
	longitude: string;

	async fetchEarthquakeWeekly(): Promise<IEarthquakeHistory[]>{
		try {
			const timestamp = new Date().getTime();
			const response = await fetch(
				`https://bmkg-content-inatews.storage.googleapis.com/gempaQL.json?t=${timestamp}`
			);
			const data = (await response.json()) as ResponseEarthquakeWeekly;
			
			
			const earthquakes = data.features.map((earthquake) => {
				const [long, lat, elevation] = earthquake.geometry.coordinates;
				return {
					id: "weekly",
					location: earthquake.properties.place,
					date: new Date(earthquake.properties.time).toLocaleDateString("id-ID", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					}),
					time: earthquake.properties.time,
					magnitude: parseFloat(earthquake.properties.mag).toFixed(2),
					depth: parseFloat(earthquake.properties.depth).toFixed(2),
					latitude: parseFloat(lat).toFixed(2),
					longitude: parseFloat(long).toFixed(2),
				};
			});

			return earthquakes;
		} catch (error) {
			return [];
		}
	}

	async fetchLatestFeltEarthquake(): Promise<IEarthquakeHistory | null>{
		try {
			const timestamp = new Date().getTime();
			const response = await fetch(
				`https://bmkg-content-inatews.storage.googleapis.com/datagempa.json?t=${timestamp}`
			);
			const data = (await response.json()) as ResponseLatestEarthquake;
			const time = new Date(data.sent.replace("WIB", "+07:00"));
			time.setHours(time.getHours() - 7);
			const offset = new Date().getTimezoneOffset() * 60 * 1000;
			const timezone = -(new Date().getTimezoneOffset() / 60);
			const timezoneText = timezone === 7 ? "WIB" : timezone === 8 ? "WITA" : timezone === 9 ? "WIT" : "";
			time.setTime(time.getTime() - offset);
			const earthquake = {
				id: "latest-felt",
				title: "Gempa Terakhir\nDirasakan",
				location: data.info.area,
				date: time.toLocaleDateString("id-ID", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
				time: time.toLocaleTimeString("id-ID", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}) + " " + timezoneText,
				magnitude: parseFloat(data.info.magnitude).toFixed(2),
				depth: parseFloat(data.info.depth).toFixed(2),
				latitude: parseFloat(data.info.latitude).toFixed(2),
				longitude: parseFloat(data.info.longitude).toFixed(2),
				station: data.sender,
			};

			return earthquake;
		} catch (error) {
			return null;
		}
	}

	async fetchLatestEarthquake(): Promise<IEarthquakeHistory | null>{
		try {
			const timestamp = new Date().getTime();
			const response = await fetch(
				`https://bmkg-content-inatews.storage.googleapis.com/lastQL.json?t=${timestamp}`
			);
			const data = (await response.json()) as ResponseLatestFeltEarthquake;

			const earthquake = data.features[0];

			const [long, lat, elevation] = earthquake.geometry.coordinates;
			const time = new Date(earthquake.properties.time);
			const offset = new Date().getTimezoneOffset() * 60 * 1000;
			const timezone = -(new Date().getTimezoneOffset() / 60);
			const timezoneText = timezone === 7 ? "WIB" : timezone === 8 ? "WITA" : "WIT";
			time.setTime(time.getTime() - offset);
			return {
				id: "latest",
				title: "Gempa Terakhir\nRealtime M > 2",
				location: earthquake.properties.place,
				date: time.toLocaleDateString("id-ID", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
				time: time.toLocaleTimeString("id-ID", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}) + " " + timezoneText,
				magnitude: parseFloat(earthquake.properties.mag).toFixed(2),
				depth: parseFloat(earthquake.properties.depth).toFixed(2),
				latitude: parseFloat(lat).toFixed(2),
				longitude: parseFloat(long).toFixed(2),
				station: earthquake.properties.id,
			};
		} catch (error) {
			return null;
		}
	}
}
