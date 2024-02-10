import STATIONS_DATA from "@/assets/data/stations.json";
import { SeismogramPlotType } from "@/types/_index";
import { pWavesData } from "./earthquakeDetection";
import { socket } from "./_index";
import IndexedDB from "@/lib/IndexedDB";

const stations = STATIONS_DATA;
const seismogramSockets = {
	...stations.map((s) => [s.code, null]),
};
const seismogramInterval = {
	...stations.map((s) => [s.code, null]),
};
const seismogramData = new Map<string, SeismogramDataType>(
	stations.map((s) => [
		s.code,
		{
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
			currentIndex: 0,
		},
	])
);
const seismogramHistoryData = new Map<string, SeismogramDataType>(
	stations.map((s) => [
		s.code,
		{
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
			currentIndex: 0,
		},
	])
);

const SAMPLING_RATE = 20;
const FREQUENCY_UPDATE = 3000;
const BUFFER = 3600;
let isFetching = false;

export type SeismogramDataType = {
	channelZ: SeismogramPlotType;
	channelN: SeismogramPlotType;
	channelE: SeismogramPlotType;
	pWaves: any[];
	currentIndex: number;
};

export type SeismogramTempDataType = {
	channelZ: SeismogramPlotType;
	channelN: SeismogramPlotType;
	channelE: SeismogramPlotType;
	pWaves: any[];
};

const onmessage = async (event: MessageEvent) => {
	const { station, message, mode, start_date, end_date } = event.data;
	const stationData = stations.find((s) => s.code === station);
	if (mode === "simulation") {
		simulateStationSeismogram(station);
	} else {
		if (stationData && message === "stream") {
			streamStationSeismogram(station);
		} else if (stationData && message === "stop") {
			stopStationSeismogram(stationData.code);
		} else if (stationData && message === "lastData") {
			// batching per 500 data
			const data = seismogramData.get(station);
			postMessage({
				station: station,
				data: data,
			});
		} else if (stationData && message === "history" && start_date && end_date) {
			getHistoryStationSeismogram(station, start_date, end_date);
		}
	}

	async function streamStationSeismogram(station: string) {
		seismogramSockets[station] = socket;
		seismogramSockets[station].on(
			`waves-data-${station}`,
			async (data: any) => {
				// get data from indexedDB
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

				// loop object data
				for (const key in data) {
					const value = data[key];
					const time = new Date(parseInt(key.split("/")[1]));
					tempData.channelZ.x.push(time.getTime());
					tempData.channelZ.y.push(value.Z);
					tempData.channelN.x.push(time.getTime());
					tempData.channelN.y.push(value.N);
					tempData.channelE.x.push(time.getTime());
					tempData.channelE.y.push(value.E);
				}

				// save data to indexedDB
				await IndexedDB.write({
					objectStore: "seismogramTempData",
					keyPath: "station",
					key: station,
					data: tempData,
				});
			}
		);

		seismogramInterval[station] = setInterval(async () => {
			const tempData = await IndexedDB.read(
				"seismogramTempData",
				station
			);
			const data = seismogramData.get(station);
			if (!tempData || tempData.channelZ.x.length === 0) return;
			const currentLength = data.currentIndex;

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

			if (currentLength < tempData.channelZ.x.length) {
				newData.channelZ.x.push(
					...tempData.channelZ.x.slice(
						currentLength,
						currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
					)
				);
				newData.channelZ.y.push(
					...tempData.channelZ.y.slice(
						currentLength,
						currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
					)
				);
				newData.channelN.x.push(
					...tempData.channelN.x.slice(
						currentLength,
						currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
					)
				);
				newData.channelN.y.push(
					...tempData.channelN.y.slice(
						currentLength,
						currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
					)
				);
				newData.channelE.x.push(
					...tempData.channelE.x.slice(
						currentLength,
						currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
					)
				);
				newData.channelE.y.push(
					...tempData.channelE.y.slice(
						currentLength,
						currentLength + (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000
					)
				);

				data.channelZ.x.push(...newData.channelZ.x);
				data.channelZ.y.push(...newData.channelZ.y);
				data.channelN.x.push(...newData.channelN.x);
				data.channelN.y.push(...newData.channelN.y);
				data.channelE.x.push(...newData.channelE.x);
				data.channelE.y.push(...newData.channelE.y);
				data.currentIndex += (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000;

				// check if there is p wave
				let pWave = pWavesData.get(station);
				if (pWave.length > 0) {
					for (let i = 0; i < pWave.length; i++) {
						// if the p wave time is not range channelZ time, then skipped
						if (
							pWave[i].x[0] < data.channelZ.x[0] ||
							pWave[i].x[0] > data.channelZ.x[data.channelZ.x.length - 1]
						) {
							continue;
						}

						const pWaveTemp = pWave[i];
						data.pWaves.push(
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

						pWave.splice(i, 1);
					}
					pWavesData.set(station, pWave);
				}

				// if the current length waves is more than BUFFER, then remove the first BUFFER / 2
				if (data.channelZ.x.length > BUFFER) {
					data.channelZ.x.splice(0, BUFFER / 2);
					data.channelZ.y.splice(0, BUFFER / 2);
					data.channelN.x.splice(0, BUFFER / 2);
					data.channelN.y.splice(0, BUFFER / 2);
					data.channelE.x.splice(0, BUFFER / 2);
					data.channelE.y.splice(0, BUFFER / 2);

					tempData.channelZ.x.splice(0, BUFFER / 2);
					tempData.channelZ.y.splice(0, BUFFER / 2);
					tempData.channelN.x.splice(0, BUFFER / 2);
					tempData.channelN.y.splice(0, BUFFER / 2);
					tempData.channelE.x.splice(0, BUFFER / 2);
					tempData.channelE.y.splice(0, BUFFER / 2);
					data.currentIndex = 0;

					// pwaves
					const startTime = data.channelZ.x[0];
					const endTime = data.channelZ.x[data.channelZ.x.length - 1];
					data.pWaves = data.pWaves.filter((pWave) => {
						const pWaveTime = pWave.x[0];
						return pWaveTime >= startTime && pWaveTime <= endTime;
					});
					pWave = pWave.filter((pWave) => {
						const pWaveTime = pWave.x[0];
						return pWaveTime >= startTime && pWaveTime <= endTime;
					});
					pWavesData.set(station, pWave);
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
					data: {
						channelZ: {
							x: seismogramHistoryData
								.get(station)
								.channelZ.x.concat(seismogramData.get(station).channelZ.x),
							y: seismogramHistoryData
								.get(station)
								.channelZ.y.concat(seismogramData.get(station).channelZ.y),
						},
						channelN: {
							x: seismogramHistoryData
								.get(station)
								.channelN.x.concat(seismogramData.get(station).channelN.x),
							y: seismogramHistoryData
								.get(station)
								.channelN.y.concat(seismogramData.get(station).channelN.y),
						},
						channelE: {
							x: seismogramHistoryData
								.get(station)
								.channelE.x.concat(seismogramData.get(station).channelE.x),
							y: seismogramHistoryData
								.get(station)
								.channelE.y.concat(seismogramData.get(station).channelE.y),
						},
						pWaves: seismogramHistoryData
							.get(station)
							.pWaves.concat(seismogramData.get(station).pWaves),
					},
				});
			}
		}, FREQUENCY_UPDATE);
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
		seismogramInterval[station] = setInterval(() => {
			const data = seismogramData.get(station);
			let time = Date.now();
			for (let i = 0; i < (SAMPLING_RATE * FREQUENCY_UPDATE) / 1000; i++) {
				data.channelZ.x.push(time);
				data.channelZ.y.push(Math.random() * 2000 + 500);
				data.channelN.x.push(time);
				data.channelN.y.push(Math.random() * 1000 + 200);
				data.channelE.x.push(time);
				data.channelE.y.push(Math.random() * 500 + 100);

				time += 1000 / SAMPLING_RATE;
			}

			// check if there is p wave
			const pWave = pWavesData.get(station);
			if (pWave.length > 0) {
				for (let i = 0; i < pWave.length; i++) {
					// if the p wave time is not range channelZ time, then skipped
					if (
						pWave[i].x[0] < data.channelZ.x[0] ||
						pWave[i].x[0] > data.channelZ.x[data.channelZ.x.length - 1]
					) {
						continue;
					}

					const pWaveTemp = pWave[i];
					data.pWaves.push(
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

					pWave.splice(i, 1);
				}
				pWavesData.set(station, pWave);
			}

			// if the current length waves is more than BUFFER, then remove the first BUFFER / 2
			if (data.channelZ.x.length > BUFFER) {
				data.channelZ.x.splice(0, BUFFER / 2);
				data.channelZ.y.splice(0, BUFFER / 2);
				data.channelN.x.splice(0, BUFFER / 2);
				data.channelN.y.splice(0, BUFFER / 2);
				data.channelE.x.splice(0, BUFFER / 2);
				data.channelE.y.splice(0, BUFFER / 2);

				// pwaves
				const startTime = data.channelZ.x[0];
				const endTime = data.channelZ.x[data.channelZ.x.length - 1];
				data.pWaves = data.pWaves.filter((pWave) => {
					const pWaveTime = pWave.x[0];
					return pWaveTime >= startTime && pWaveTime <= endTime;
				});
			}

			seismogramData.set(station, data);

			postMessage({
				station: station,
				data: {
					channelZ: {
						x: seismogramHistoryData
							.get(station)
							.channelZ.x.concat(seismogramData.get(station).channelZ.x),
						y: seismogramHistoryData
							.get(station)
							.channelZ.y.concat(seismogramData.get(station).channelZ.y),
					},
					channelN: {
						x: seismogramHistoryData
							.get(station)
							.channelN.x.concat(seismogramData.get(station).channelN.x),
						y: seismogramHistoryData
							.get(station)
							.channelN.y.concat(seismogramData.get(station).channelN.y),
					},
					channelE: {
						x: seismogramHistoryData
							.get(station)
							.channelE.x.concat(seismogramData.get(station).channelE.x),
						y: seismogramHistoryData
							.get(station)
							.channelE.y.concat(seismogramData.get(station).channelE.y),
					},
					pWaves: seismogramHistoryData
						.get(station)
						.pWaves.concat(seismogramData.get(station).pWaves),
				},
			});
		}, FREQUENCY_UPDATE);
	}

	async function getHistoryStationSeismogram(
		station: string,
		start_date: number,
		end_date: number
	) {
		if (isFetching) return;

		isFetching = true;
		const historyData = seismogramHistoryData.get(station);
		const currentData = seismogramData.get(station);

		// start_date not more than current date and not in range of currentData and historyData
		if (start_date > Date.now()) return;
		if (new Date(start_date).getDate() !== new Date().getDate()) return;

		if (currentData.channelZ.x.length > 0) {
			if (
				start_date >= currentData.channelZ.x[0] &&
				end_date <= currentData.channelZ.x[currentData.channelZ.x.length - 1]
			) {
				isFetching = false;
				return;
			}
			if (
				start_date > currentData.channelZ.x[currentData.channelZ.x.length - 1]
			) {
				isFetching = false;
				return;
			}

			if (end_date > currentData.channelZ.x[0]) {
				end_date = currentData.channelZ.x[0] - 50;
			}
		}
		if (historyData.channelZ.x.length > 0) {
			if (
				start_date >= historyData.channelZ.x[0] &&
				end_date <= historyData.channelZ.x[historyData.channelZ.x.length - 1]
			) {
				isFetching = false;
				return;
			}
			if (
				start_date > historyData.channelZ.x[historyData.channelZ.x.length - 1]
			) {
				isFetching = false;
				return;
			}
		}

		const response = await fetch(
			`http://localhost:3333/waves?station=${station}&start_date=${start_date}&end_date=${end_date}`
		);
		let data = await response.json();

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
				currentIndex: 0,
			};
			for (const obj of Object.entries(data) as any) {
				const key = obj[0];
				const dataValue = obj[1];
				const date = new Date(parseInt(key));
				const offset = -(new Date().getTimezoneOffset() * 60 * 1000);
				date.setTime(date.getTime() - offset);

				newSeismogramData.channelZ.x.push(date.getTime());
				newSeismogramData.channelZ.y.push(dataValue.Z);
				newSeismogramData.channelN.x.push(date.getTime());
				newSeismogramData.channelN.y.push(dataValue.N);
				newSeismogramData.channelE.x.push(date.getTime());
				newSeismogramData.channelE.y.push(dataValue.E);
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
						.channelZ.x.concat(seismogramData.get(station).channelZ.x),
					y: seismogramHistoryData
						.get(station)
						.channelZ.y.concat(seismogramData.get(station).channelZ.y),
				},
				channelN: {
					x: seismogramHistoryData
						.get(station)
						.channelN.x.concat(seismogramData.get(station).channelN.x),
					y: seismogramHistoryData
						.get(station)
						.channelN.y.concat(seismogramData.get(station).channelN.y),
				},
				channelE: {
					x: seismogramHistoryData
						.get(station)
						.channelE.x.concat(seismogramData.get(station).channelE.x),
					y: seismogramHistoryData
						.get(station)
						.channelE.y.concat(seismogramData.get(station).channelE.y),
				},
				pWaves: seismogramHistoryData
					.get(station)
					.pWaves.concat(seismogramData.get(station).pWaves),
			},
		});
	}
};
addEventListener("message", onmessage);
