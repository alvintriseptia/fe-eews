import { IEarthquakeDetection } from "@/entities/_index";
import { SeismogramPlotType } from "@/types/_index";
import STATIONS_DATA from "@/assets/data/stations.json";
import { socket } from "./_index";

export const pWavesData = new Map<string, SeismogramPlotType[]>(
	STATIONS_DATA.map((s) => [s.code, [] as SeismogramPlotType[]])
);

const onmessage = (event: MessageEvent) => {
	const { data } = event;

	if (data.mode === "simulation") {
		const typeDetection = ["warning", "warning", "warning"];
		const earthquakeDetection: IEarthquakeDetection = {
			title: "Terdeteksi Gelombang P",
			description: "A magnitude 5.0 earthquake is predicted to occur cuy",
			time_stamp: Date.now(),
			depth: 5,
			lat: -2.5927,
			long: 140.1678,
			mag: 10,
			detection: typeDetection[Math.floor(Math.random() * 3)],
			countdown: 10,
			station: "GENI",
		};

		addPWave("GENI", Date.now());

		postMessage(earthquakeDetection);

		// setInterval(() => {
		// 	const station = STATIONS_DATA[Math.floor(Math.random() * STATIONS_DATA.length) - 1];
		// 	earthquakeDetection.lat = station.latitude;
		// 	earthquakeDetection.long = station.longitude;
		// 	earthquakeDetection.detection =
		// 		typeDetection[Math.floor(Math.random() * 3)];
		// 	earthquakeDetection.station = station.code;
		// 	addPWave(station.code, Date.now());

		// 	postMessage(earthquakeDetection);
		// }, 60000);
	} else {
		socket.on("detection-data-all", (message: any) => {
			// check timestamp, jika lebih dari 5 menit, maka diskip
			const date = new Date(message.time_stamp);
			// timezone in local
			const timezoneOffset = new Date().getTimezoneOffset() * 60000;
			date.setTime(date.getTime() - timezoneOffset);
			const now = new Date();
			const diff = now.getTime() - date.getTime();
			if (diff > 300000) return;

			postMessage(message);

			addPWave(message.station, message.time_stamp);
		});
	}

	function addPWave(station: string, creation_date: number) {
		const pWaveTemp = {
			x: [] as Array<number>,
			y: [] as Array<number>,
			line: {
				color: "#FF0000",
				width: 2,
			},
			showlegend: false,
			xaxis: "x",
		};

		const date = new Date(creation_date);
		pWaveTemp.x.push(date.getTime());
		pWaveTemp.y.push(0);
		pWaveTemp.x.push(date.getTime());
		pWaveTemp.y.push(20000);

		const data = pWavesData.get(station);

		data.push(pWaveTemp);
	}
};

addEventListener("message", onmessage);
