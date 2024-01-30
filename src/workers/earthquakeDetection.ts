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
			lat: -6.1751,
			long: 106.826,
			mag: 2,
			detection: typeDetection[Math.floor(Math.random() * 3)],
			countdown: 10,
			station: "BBJI",
		};

		addPWave("BBJI", Date.now());

		postMessage(earthquakeDetection);

		setInterval(() => {
			earthquakeDetection.lat = Math.random() * 10 - 5;
			earthquakeDetection.long = Math.random() * 10 - 5;
			earthquakeDetection.detection =
				typeDetection[Math.floor(Math.random() * 3)];
			earthquakeDetection.station = "BBJI";
			addPWave("BBJI", Date.now());

			postMessage(earthquakeDetection);
		}, 30000);
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