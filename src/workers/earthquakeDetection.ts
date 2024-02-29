import { IEarthquakeDetection } from "@/entities/_index";
import STATIONS_DATA from "@/assets/data/stations.json";
import Socket from "@/lib/socket";
import IndexedDB from "@/lib/IndexedDB";
const socket = Socket.getInstance().getSocket();

console.log("Worker earthquakeDetection is running");

const onmessage = (event: MessageEvent) => {
	const { data } = event;
	if (data.type == "earthquake") {
		if (data.mode === "simulation") {
			const typeDetection = ["warning", "warning", "warning"];
			const earthquakeDetection: IEarthquakeDetection = {
				title: "Terdeteksi Gelombang P",
				description: "Harap perhatian, muncul deteksi gelombang P di stasiun ",
				time_stamp: Date.now(),
				depth: 5,
				lat: -2.5927,
				long: 140.1678,
				mag: 2,
				detection: typeDetection[Math.floor(Math.random() * 3)],
				countdown: 10,
				station: "BBJI",
			};

			addPWave("BBJI", Date.now());

			postMessage(earthquakeDetection);

			setInterval(() => {
				const station = STATIONS_DATA[Math.floor(Math.random() * 18)];
				earthquakeDetection.title = "Terdeteksi Gelombang P";
				earthquakeDetection.description =
					"Harap perhatian, muncul deteksi gelombang P di stasiun " +
					station.code;
				earthquakeDetection.lat = station.latitude;
				earthquakeDetection.long = station.longitude;
				earthquakeDetection.detection =
					typeDetection[Math.floor(Math.random() * 3)];
				earthquakeDetection.station = station.code;
				earthquakeDetection.time_stamp = Date.now();

				addPWave(station.code, Date.now());

				postMessage(earthquakeDetection);
			}, 30000);
		} else {
			console.log("Listening to prediction-data-all");
			socket.on("prediction-data-all", (message: any) => {
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
	}
};

async function addPWave(station: string, creation_date: number) {
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

	let tempData = {
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
	};

	const tempDataFromIndexedDB = await IndexedDB.read(
		"seismogramTempData",
		station
	);

	if (tempDataFromIndexedDB !== null) {
		tempData = tempDataFromIndexedDB;
	}

	const date = new Date(creation_date);
	pWaveTemp.x.push(date.getTime());
	pWaveTemp.y.push(0);
	pWaveTemp.x.push(date.getTime());
	pWaveTemp.y.push(20000);
	tempData.pWaves.push(pWaveTemp);
	await IndexedDB.write({
		objectStore: "seismogramTempData",
		keyPath: "station",
		key: station,
		data: tempData,
	});
}

addEventListener("message", onmessage);