import { IExternalSource } from "@/entities/_index";
import {
	ResponseLatestFeltEarthquake,
	ResponseLatestEarthquake,
	ResponseEarthquakeWeekly,
} from "@/models/response/_index";

export default class ExternalSource implements IExternalSource {
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

	async fetchEarthquakeWeekly() {
		try {
			const timestamp = new Date().getTime();
			const response = await fetch(
				`https://bmkg-content-inatews.storage.googleapis.com/gempaQL.json?t=${timestamp}`
			);
			const data = (await response.json()) as ResponseEarthquakeWeekly;
			
			
			const earthquakes = data.features.map((earthquake) => {
				const [long, lat, elevation] = earthquake.geometry.coordinates;
				return {
					location: earthquake.properties.place,
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

	async fetchLatestFeltEarthquake() {
		try {
			const timestamp = new Date().getTime();
			const response = await fetch(
				`https://bmkg-content-inatews.storage.googleapis.com/datagempa.json?t=${timestamp}`
			);
			const data = (await response.json()) as ResponseLatestEarthquake;
			const time = new Date(data.sent.replace("WIB", "+07:00"));
			const zoneOffset = time.getTimezoneOffset() / 60;
			time.setHours(time.getHours() - zoneOffset);
			const earthquake = {
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
				}),
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

	async fetchLatestEarthquake() {
		try {
			const timestamp = new Date().getTime();
			const response = await fetch(
				`https://bmkg-content-inatews.storage.googleapis.com/lastQL.json?t=${timestamp}`
			);
			const data = (await response.json()) as ResponseLatestFeltEarthquake;

			const earthquake = data.features[0];

			const [long, lat, elevation] = earthquake.geometry.coordinates;
			const time = new Date(earthquake.properties.time);
			const zoneOffset = time.getTimezoneOffset() / 60;
			time.setHours(time.getHours() - zoneOffset);
			return {
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
				}),
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
