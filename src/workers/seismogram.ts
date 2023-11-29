import STATIONS_DATA from "@/assets/data/stations.json";
import { ISeismogram } from "@/entities/ISeismogram";
import { io } from "socket.io-client";

const socket = io("http://localhost:3333", {
	transports: ["websocket"],
});
const stations = STATIONS_DATA;
const seismogramSockets = {
	...stations.map((s) => [s.code, null]),
};

const onmessage = (event: MessageEvent) => {
	const { station, message, creation_date, mode } = event.data;
	const stationData = stations.find((s) => s.code === station);

	if (mode === "simulation") {
		simulateStationSeismogram(stationData.code);
	} else {
		if (stationData && message === "stream") {
			streamStationSeismogram(stationData.code);
		} else if (stationData && message === "earthquake") {
			postMessage({
				station,
				creation_date,
			});
		} else if (stationData && message === "stop") {
			stopStationSeismogram(stationData.code);
		}
	}
};

function streamStationSeismogram(station: string) {
	console.log("streaming", station);
	seismogramSockets[station] = socket;
	seismogramSockets[station].on(`waves-data-${station}`, (data: any) => {
		console.log(data)
		postMessage({
			station,
			seismogram: {
				creation_date: Date.now(),
				z_channel: data.Z,
				n_channel: data.N,
				e_channel: data.E,
				station: station,
			},
		});
	});
}

function stopStationSeismogram(station: string) {
	seismogramSockets[station].disconnect();
	seismogramSockets[station] = null;
}

function simulateStationSeismogram(station: string) {
	setInterval(() => {
		postMessage({
			station,
			seismogram: {
				creation_date: Date.now(),
				z_channel: Math.random() * 2000 + 500,
				n_channel: Math.random() * 1000 + 200,
				e_channel: Math.random() * 500 + 100,
				station: station,
			}
		});
	}, 1000);
}

addEventListener("message", onmessage);
