import STATIONS_DATA from "@/assets/data/stations.json";
import { SeismogramPlotType } from "@/types/_index";
import { io } from "socket.io-client";
const socket = io("http://localhost:3333", {
	transports: ["websocket"],
});
const stations = STATIONS_DATA;
const seismogramSockets = {
	...stations.map((s) => [s.code, null]),
};
const seismogramInterval = {
	...stations.map((s) => [s.code, null]),
};
const seismogramData: Record<string, SeismogramDataType> = {
	...stations.reduce((acc, s) => {
		acc[s.code] = {
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
		return acc;
	}, {} as Record<string, SeismogramDataType>),
};

const SAMPLING_RATE = 20;

const seismogramTempData: Record<string, SeismogramDataType> = {
	...stations.reduce((acc, s) => {
		acc[s.code] = {
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
		return acc;
	}, {} as Record<string, SeismogramDataType>),
};

export type SeismogramDataType = {
	channelZ: SeismogramPlotType;
	channelN: SeismogramPlotType;
	channelE: SeismogramPlotType;
	pWaves: any[];
};

const onmessage = (event: MessageEvent) => {
	const { station, message, creation_date, mode } = event.data;
	const stationData = stations.find((s) => s.code === station);

	if (mode === "simulation") {
		simulateStationSeismogram(stationData.code);
	} else {
		if (stationData && message === "stream") {
			streamStationSeismogram(stationData.code);
		} else if (stationData && message === "stop") {
			stopStationSeismogram(stationData.code);
		} else if (stationData && message === "pWave") {
			addPWave(stationData.code, creation_date);
		} else if (stationData && message === "lastData") {
			postMessage({
				station: stationData.code,
				data: seismogramData[stationData.code],
			});
		}
	}
};

function streamStationSeismogram(station: string) {
	// if there is data in the seismogramData, then send it first
	// if (seismogramData[station].channelZ.x.length > 0) {
	// 	postMessage({
	// 		station: station,
	// 		data: seismogramData[station],
	// 	});
	// }

	seismogramSockets[station] = socket;
	seismogramSockets[station].on(`waves-data-${station}`, (data: any) => {
		// loop object data
		for (const key in data) {
			const value = data[key];
			const time = parseInt(key.split("/")[1]);

			seismogramTempData[station].channelZ.x.push(time);
			seismogramTempData[station].channelZ.y.push(value.Z);
			seismogramTempData[station].channelN.x.push(time);
			seismogramTempData[station].channelN.y.push(value.N);
			seismogramTempData[station].channelE.x.push(time);
			seismogramTempData[station].channelE.y.push(value.E);
		}
	});

	seismogramInterval[station] = setInterval(() => {
		if (seismogramTempData[station].channelZ.x.length === 0) return;
		const currentLength = seismogramData[station].channelZ.x.length;

		const newData = {
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

		if (currentLength < seismogramTempData[station].channelZ.x.length) {
			newData.channelZ.x.push(
				...seismogramTempData[station].channelZ.x.slice(
					currentLength,
					currentLength + SAMPLING_RATE
				)
			);
			newData.channelZ.y.push(
				...seismogramTempData[station].channelZ.y.slice(
					currentLength,
					currentLength + SAMPLING_RATE
				)
			);
			newData.channelN.x.push(
				...seismogramTempData[station].channelN.x.slice(
					currentLength,
					currentLength + SAMPLING_RATE
				)
			);
			newData.channelN.y.push(
				...seismogramTempData[station].channelN.y.slice(
					currentLength,
					currentLength + SAMPLING_RATE
				)
			);
			newData.channelE.x.push(
				...seismogramTempData[station].channelE.x.slice(
					currentLength,
					currentLength + SAMPLING_RATE
				)
			);
			newData.channelE.y.push(
				...seismogramTempData[station].channelE.y.slice(
					currentLength,
					currentLength + SAMPLING_RATE
				)
			);

			seismogramData[station].channelZ.x.push(...newData.channelZ.x);
			seismogramData[station].channelZ.y.push(...newData.channelZ.y);
			seismogramData[station].channelN.x.push(...newData.channelN.x);
			seismogramData[station].channelN.y.push(...newData.channelN.y);
			seismogramData[station].channelE.x.push(...newData.channelE.x);
			seismogramData[station].channelE.y.push(...newData.channelE.y);

			// if the current length waves is more than 200.000, then remove the first 100.000
			if (seismogramData[station].channelZ.x.length > 200000) {
				seismogramData[station].channelZ.x.splice(0, 100000);
				seismogramData[station].channelZ.y.splice(0, 100000);
				seismogramData[station].channelN.x.splice(0, 100000);
				seismogramData[station].channelN.y.splice(0, 100000);
				seismogramData[station].channelE.x.splice(0, 100000);
				seismogramData[station].channelE.y.splice(0, 100000);
			}

			postMessage({
				station: station,
				data: seismogramData[station],
			});
		}
	}, 1000);
}

function stopStationSeismogram(station: string) {
	seismogramSockets[station].disconnect();
	seismogramSockets[station] = null;

	clearInterval(seismogramInterval[station]);
	seismogramInterval[station] = null;

	seismogramData[station] = {
		channelZ: {
			x: [],
			y: [],
		} as SeismogramPlotType,
		channelN: {
			x: [],
			y: [],
		} as SeismogramPlotType,
		channelE: {
			x: [],
			y: [],
		} as SeismogramPlotType,
		pWaves: [] as SeismogramPlotType[],
	};
}

function simulateStationSeismogram(station: string) {
	// if there is data in the seismogramData, then send it first
	// if (seismogramData[station].channelZ.x.length > 0) {
	// 	postMessage({
	// 		station: station,
	// 		data: seismogramData[station],
	// 	});
	// }

	setInterval(() => {
		seismogramData[station].channelZ.x.push(Date.now());
		seismogramData[station].channelZ.y.push(Math.random() * 2000 + 500);
		seismogramData[station].channelN.x.push(Date.now());
		seismogramData[station].channelN.y.push(Math.random() * 1000 + 200);
		seismogramData[station].channelE.x.push(Date.now());
		seismogramData[station].channelE.y.push(Math.random() * 500 + 100);

		// if the current length waves is more than 200.000, then remove the first 100.000
		if (seismogramData[station].channelZ.x.length > 200000) {
			seismogramData[station].channelZ.x.splice(0, 100000);
			seismogramData[station].channelZ.y.splice(0, 100000);
			seismogramData[station].channelN.x.splice(0, 100000);
			seismogramData[station].channelN.y.splice(0, 100000);
			seismogramData[station].channelE.x.splice(0, 100000);
			seismogramData[station].channelE.y.splice(0, 100000);
		}

		postMessage({
			station: station,
			data: seismogramData[station],
		});
	}, 5000);
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
	pWaveTemp.y.push(6000);

	seismogramData[station].pWaves.push(
		{
			...pWaveTemp,
			yaxis: "y4",
		},
		{
			...pWaveTemp,
			yaxis: "y5",
		},
		{
			...pWaveTemp,
			yaxis: "y6",
		}
	);

	postMessage({
		station: station,
		data: seismogramData[station],
	});
}

addEventListener("message", onmessage);
