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

			addPWave("BBJI", Date.now(), earthquakeDetection);

			postMessage(earthquakeDetection);

			setInterval(() => {
				for (let i = 0; i < 3; i++) {
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

					addPWave(station.code, Date.now(), earthquakeDetection);
				}
			}, 30000);
		} else {
			console.log("Listening to prediction-data-all");
			socket.on("prediction-data-all", (message: any) => {
				// check timestamp, jika lebih dari 5 menit, maka diskip
				const date = new Date(message.time_stamp);
				// timezone in local
				// const offset = new Date().getTimezoneOffset() * 60 * 1000;
				// date.setTime(date.getTime() - offset);
				const now = new Date();
				// const diff = now.getTime() - date.getTime();
				const diff = 0;
				message.time_stamp = date.getTime();

				if (diff > 300000) return;
				addPWave(message.station, date.getTime(), message);
			});
		}
	}

	async function addPWave(station: string, creation_date: number, earthquakeDetection: object) {
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
			pWaves: [],
		};
	
		const tempDataFromIndexedDB = await IndexedDB.read(
			"pWavesTempData",
			station
		);
	
		if (tempDataFromIndexedDB !== null) {
			tempData = tempDataFromIndexedDB;
		}
	
		//check jika data terakhir dengan data yang baru kurang dari 5 detik, tidak perlu postMessage
		if (tempData.pWaves.length > 0) {
			const lastData = tempData.pWaves[tempData.pWaves.length - 1];
			const lastDate = lastData.x[lastData.x.length - 1];
			const diff = creation_date - lastDate;
			if (diff > 5000){
				postMessage(earthquakeDetection);
			}
		}else{
			postMessage(earthquakeDetection);
		}
	
		const date = new Date(creation_date);
		pWaveTemp.x.push(date.getTime());
		pWaveTemp.y.push(0);
		pWaveTemp.x.push(date.getTime());
		pWaveTemp.y.push(20000);
		tempData.pWaves.push(pWaveTemp);
		await IndexedDB.write({
			objectStore: "pWavesTempData",
			keyPath: "station",
			key: station,
			data: tempData,
		});
	}
};

addEventListener("message", onmessage);
