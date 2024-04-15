import STATIONS_DATA from "@/assets/data/stations.json";
import { SeismogramPlotType } from "@/types/_index";
// import { pWavesData } from "./earthquakeDetection";
import IndexedDB from "@/lib/IndexedDB";
import Socket from "@/lib/socket";
import Station from "@/models/Station";

const socket = Socket.getInstance().getSocket();
let stations = [];
let seismogramSockets = {};
let seismogramInterval = {};
let seismogramData = new Map();
let seismogramHistoryData = new Map();

// Get API host
const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost";
const apiPort = process.env.NEXT_PUBLIC_API_PORT || "3333";

const SAMPLING_RATE = 5;
const FREQUENCY_UPDATE = 2000;
const BUFFER = 3000;
let isFetching = false;

export type SeismogramDataType = {
	channelZ: SeismogramPlotType[];
	channelN: SeismogramPlotType[];
	channelE: SeismogramPlotType[];
	pWaves: SeismogramPlotType[];
	currentIndex: number;
};

export type SeismogramTempDataType = {
	channelZ: SeismogramPlotType[];
	channelN: SeismogramPlotType[];
	channelE: SeismogramPlotType[];
	pWaves: SeismogramPlotType[];
};

const onmessage = async (event: MessageEvent) => {
	const { station, message, mode, start_date, end_date, type } = event.data;
	if (type == "seismogram") {
		//check if station not in current map, then add it
		if (!seismogramData.has(station)) {
			seismogramData.set(station, {
				channelZ: [],
				channelN: [],
				channelE: [],
				pWaves: [],
				currentIndex: 0,
			});
			seismogramHistoryData.set(station, {
				channelZ: [],
				channelN: [],
				channelE: [],
				pWaves: [],
				currentIndex: 0,
			});
			seismogramInterval[station] = null;
			seismogramSockets[station] = null;
		}

		if (mode === "simulation") {
			if (station && message === "stop") {
				stopStationSeismogram(station);
			} else if (station && message === "restart") {
				stopStationSeismogram(station);
				simulateStationSeismogram(station);
			} else {
				simulateStationSeismogram(station);
			}
		} else {
			if (station && message === "stream") {
				streamStationSeismogram(station);
			} else if (station && message === "stop") {
				stopStationSeismogram(station);
			} else if (station && message === "restart") {
				stopStationSeismogram(station);
				streamStationSeismogram(station);
			} else if (station && message === "lastData") {
				// batching per 500 data
				const data = seismogramData.get(station);
				postMessage({
					station: station,
					data: data,
				});
			} else if (station && message === "history" && start_date && end_date) {
				getHistoryStationSeismogram(station, start_date, end_date);
			}
		}
	}
};

async function streamStationSeismogram(station: string) {
	seismogramSockets[station] = socket;
	seismogramSockets[station].on(`waves-data-${station}`, async (data: any) => {
		// get data from indexedDB
		let tempData = {
			channelZ: [] as SeismogramPlotType[],
			channelN: [] as SeismogramPlotType[],
			channelE: [] as SeismogramPlotType[],
			pWaves: [] as SeismogramPlotType[],
		};

		const tempDataFromIndexedDB = await IndexedDB.read(
			"seismogramTempData",
			station
		);

		if (tempDataFromIndexedDB !== null) {
			tempData = tempDataFromIndexedDB;
		}

		// loop object data
		for (const key in data) {
			const value = data[key];
			// console.log(new Date(parseInt(key.split("/")[1])));
			const time = new Date(parseInt(key.split("/")[1]));
			tempData.channelZ.push({
				x: time.getTime(),
				y: value.Z,
			});
			tempData.channelN.push({
				x: time.getTime(),
				y: value.N,
			});
			tempData.channelE.push({
				x: time.getTime(),
				y: value.E,
			});
		}

		// save data to indexedDB
		await IndexedDB.write({
			objectStore: "seismogramTempData",
			keyPath: "station",
			key: station,
			data: tempData,
		});
	});

	seismogramInterval[station] = setInterval(async () => {
		const tempData = await IndexedDB.read("seismogramTempData", station);
		const data = seismogramData.get(station);
		if (!tempData || tempData.channelZ.x.length === 0) return;
		const currentLength = data.currentIndex;

		const newData = {
			channelZ: [] as SeismogramPlotType[],
			channelN: [] as SeismogramPlotType[],
			channelE: [] as SeismogramPlotType[],
			pWaves: [] as SeismogramPlotType[],
		};

		if (currentLength < tempData.channelZ.length) {
			newData.channelZ.push(
				...tempData.channelZ.slice(
					currentLength,
					currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
				)
			);
			newData.channelN.push(
				...tempData.channelN.slice(
					currentLength,
					currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
				)
			);
			newData.channelE.push(
				...tempData.channelE.slice(
					currentLength,
					currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
				)
			);

			// revalidate new data with last time of data
			let lastTimeData =
				data.channelZ.length > 0
					? data.channelZ[data.channelZ.length - 1].x
					: 0;
			const skippedData = [];
			// loop object data
			for (let i = 0; i < newData.channelZ.length; i++) {
				data.currentIndex++;
				const time = newData.channelZ[i].x;
				if (time <= lastTimeData) {
					skippedData.push({
						time: time,
						lastTimeData: lastTimeData,
					});
				}
				lastTimeData = time;
				data.channelZ.push({
					x: time,
					y: newData.channelZ[i].y,
				});
				data.channelN.push({
					x: time,
					y: newData.channelN[i].y,
				});
				data.channelE.push({
					x: time,
					y: newData.channelE[i].y,
				});
			}

			if (skippedData.length > 0) {
				//rearrange data
				data.channelZ.sort((a, b) => a.x - b.x);
				data.channelN.sort((a, b) => a.x - b.x);
				data.channelE.sort((a, b) => a.x - b.x);
			}

			// check if there is p wave
			const pWaveData = await IndexedDB.read("pWavesTempData", station);
			let pWaves = pWaveData?.pWaves || ([] as SeismogramPlotType[]);
			if (pWaves.length > 0) {
				for (let i = 0; i < pWaves.length; i++) {
					// if the p wave time is not range channelZ time, then skipped
					if (
						pWaves[i].x[0] < data.channelZ[0] ||
						pWaves[i].x[0] > data.channelZ[data.channelZ.length - 1].x
					) {
						continue;
					}

					const pWaveTemp = pWaves[i];
					data.pWaves.push(
						{
							x: pWaveTemp.x,
							y: -100000,
						},
						{
							x: pWaveTemp.x,
							y: 100000,
						},
						{
							x: null,
							y: null,
						}
					);

					pWaves.splice(i, 1);
				}

				await IndexedDB.write({
					objectStore: "pWavesTempData",
					keyPath: "station",
					key: station,
					data: {
						pWaves: pWaves,
					},
				});
			}

			// if the current length waves is more than BUFFER, then remove the first BUFFER / 2
			if (data.channelZ.length > BUFFER) {
				data.channelZ.splice(0, BUFFER / 2);
				data.channelN.splice(0, BUFFER / 2);
				data.channelE.splice(0, BUFFER / 2);

				tempData.channelZ.splice(0, BUFFER / 2);
				tempData.channelN.splice(0, BUFFER / 2);
				tempData.channelE.splice(0, BUFFER / 2);
				data.currentIndex = 0;

				// pwaves
				const startTime = data.channelZ[0].x;
				const endTime = data.channelZ[data.channelZ.length - 1].x;
				data.pWaves = data.pWaves.filter((pWave) => {
					const pWaveTime = pWave.x;
					return (pWaveTime >= startTime && pWaveTime <= endTime) || pWaveTime == null;
				});
				pWaves = pWaves.filter((pWave) => {
					const pWaveTime = pWave.x;
					return (pWaveTime >= startTime && pWaveTime <= endTime) || pWaveTime == null;
				}); 
			}

			seismogramData.set(station, data);
			await IndexedDB.write({
				objectStore: "seismogramTempData",
				keyPath: "station",
				key: station,
				data: tempData,
			});

			postMessage({
				station: station,
				data: data,
			});
		}
	}, FREQUENCY_UPDATE);
}

function stopStationSeismogram(station: string) {
	if (seismogramSockets[station]) {
		seismogramSockets[station]?.disconnect();
		seismogramSockets[station] = null;
	}

	if (seismogramInterval[station]) {
		clearInterval(seismogramInterval[station]);
		seismogramInterval[station] = null;
	}

	seismogramData[station] = {
		channelZ: [] as SeismogramPlotType[],
		channelN: [] as SeismogramPlotType[],
		channelE: [] as SeismogramPlotType[],
		pWaves: [] as SeismogramPlotType[],
	};
}

function simulateStationSeismogram(station: string) {
	seismogramInterval[station] = setInterval(async () => {
		const data = seismogramData.get(station);
		let time = Date.now();
		for (let i = 0; i < (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000; i++) {
			data.channelZ.push({
				x: time,
				y: Math.random() * 2000 + 500,
			});
			data.channelN.push({
				x: time,
				y: Math.random() * 2000 + 500,
			});
			data.channelE.push({
				x: time,
				y: Math.random() * 2000 + 500,
			});

			time += 1000 / SAMPLING_RATE;
		}

		// check if there is p wave
		const pWaveData = await IndexedDB.read("pWavesTempData", station);
		let pWaves = pWaveData?.pWaves || ([] as SeismogramPlotType[]);
		// console.log(station, pWave)
		if (pWaves.length > 0) {
			for (let i = 0; i < pWaves.length; i++) {
				// if the p wave time is not range channelZ time, then skipped
				if (
					pWaves[i].x[0] < data.channelZ[0].x ||
					pWaves[i].x[0] > data.channelZ[data.channelZ.length - 1].x
				) {
					continue;
				}

				const pWaveTemp = pWaves[i] as SeismogramPlotType;
				data.pWaves.push(
					{
						x: pWaveTemp.x,
						y: -100000,
					},
					{
						x: pWaveTemp.x,
						y: 100000,
					},
					{
						x: null,
						y: null,
					}
				);
				// console.log("pWaves", data);

				pWaves.splice(i, 1);
			}
		}

		// if the current length waves is more than BUFFER, then remove the first BUFFER / 2
		if (data.channelZ.length > BUFFER) {
			data.channelZ.splice(0, BUFFER / 2);
			data.channelN.splice(0, BUFFER / 2);
			data.channelE.splice(0, BUFFER / 2);

			// pwaves
			const startTime = data.channelZ[0].x;
			const endTime = data.channelZ[data.channelZ.length - 1].x;
			let isAllNull = true;
			let newPWaves = data.pWaves.filter((pWave) => {
				const pWaveTime = pWave.x;
				if (pWaveTime != null) {
					isAllNull = false;
				}
				return (pWaveTime >= startTime && pWaveTime <= endTime) || pWaveTime == null;
			});

			data.pWaves = isAllNull ? [] : newPWaves;
			let previousPWaves = pWaves;
			isAllNull = true;
			pWaves = pWaves.filter((pWave) => {
				const pWaveTime = pWave.x;
				if (pWaveTime != null) {
					isAllNull = false;
				}
				return (pWaveTime >= startTime && pWaveTime <= endTime) || pWaveTime == null;
			});

			if (previousPWaves.length !== pWaves.length) {
				if(isAllNull) {
					pWaves = [];
				}
				await IndexedDB.write({
					objectStore: "pWavesTempData",
					keyPath: "station",
					key: station,
					data: {
						pWaves: pWaves,
					},
				});
			}
		}

		seismogramData.set(station, data);

		postMessage({
			station: station,
			data: data,
		});
	}, FREQUENCY_UPDATE);
}

async function getHistoryStationSeismogram(
	station: string,
	start_date: number,
	end_date: number
) {
	if (isFetching) return;

	const historyData = seismogramHistoryData.get(station);
	const currentData = seismogramData.get(station);

	console.log("check start_date", start_date, Date.now());
	if (start_date > Date.now()) return;

	if (new Date(start_date).getDate() !== new Date().getDate()) return;

	if (currentData.channelZ.length > 0) {
		if (
			start_date >= currentData.channelZ[0].x &&
			end_date <= currentData.channelZ[currentData.channelZ.length - 1].x
		)
			return;
		if (start_date > currentData.channelZ[currentData.channelZ.length - 1].x)
			return;

		if (end_date > currentData.channelZ[0].x) {
			end_date = currentData.channelZ[0].x - 50;
		}
	}

	if (historyData.channelZ.length > 0) {
		if (
			start_date >= historyData.channelZ[0].x &&
			end_date <= historyData.channelZ[historyData.channelZ.length - 1].x
		) {
			isFetching = false;
			return;
		}
		if (start_date > historyData.channelZ[historyData.channelZ.length - 1].x) {
			isFetching = false;
			return;
		}
	}
	isFetching = true;
	console.log("get history data");
	const response = await fetch(
		`${apiHost}:${apiPort}/waves?station=${station}&start_date=${start_date}&end_date=${end_date}`
	);
	let data = await response.json();
	if (data.message) {
		isFetching = false;
		return;
	}
	console.log("result history data", station, data);

	// dummy, data
	// const data = {};
	// let time = start_date;
	// while (time < end_date) {
	// 	data[time] = {
	// 		Z: Math.random() * 2000 + 500,
	// 		N: Math.random() * 1000 + 200,
	// 		E: Math.random() * 500 + 100,
	// 	};
	// 	if (time + 500 >= end_date) {
	// 		data[end_date] = {
	// 			Z: Math.random() * 2000 + 500,
	// 			N: Math.random() * 1000 + 200,
	// 			E: Math.random() * 500 + 100,
	// 		};
	// 		break;
	// 	}

	// 	time += 500;
	// }

	if (Object.keys(data).length > 0) {
		const newSeismogramData = {
			channelZ: [],
			channelN: [],
			channelE: [],
			pWaves: [],
			currentIndex: 0,
		};
		for (const obj of Object.entries(data) as any) {
			const key = obj[0];
			const dataValue = obj[1];
			const date = new Date(parseInt(key));
			// const offset = -(new Date().getTimezoneOffset() * 60 * 1000);
			// date.setTime(date.getTime() - offset);

			newSeismogramData.channelZ.push({
				x: date.getTime(),
				y: dataValue.Z,
			});
			newSeismogramData.channelN.push({
				x: date.getTime(),
				y: dataValue.N,
			});
			newSeismogramData.channelE.push({
				x: date.getTime(),
				y: dataValue.E,
			});
		}

		seismogramHistoryData.set(station, newSeismogramData);
	}
	isFetching = false;
	postMessage({
		station: station,
		data: {
			channelZ: {
				x: seismogramHistoryData
					.get(station)
					.channelZ.concat(seismogramData.get(station).channelZ),
				y: seismogramHistoryData
					.get(station)
					.channelZ.concat(seismogramData.get(station).channelZ),
			},
			channelN: {
				x: seismogramHistoryData
					.get(station)
					.channelN.concat(seismogramData.get(station).channelN),
				y: seismogramHistoryData
					.get(station)
					.channelN.concat(seismogramData.get(station).channelN),
			},
			channelE: {
				x: seismogramHistoryData
					.get(station)
					.channelE.concat(seismogramData.get(station).channelE),
				y: seismogramHistoryData
					.get(station)
					.channelE.concat(seismogramData.get(station).channelE),
			},
			pWaves: seismogramHistoryData
				.get(station)
				.pWaves.concat(seismogramData.get(station).pWaves),
		},
	});
}
addEventListener("message", onmessage);
