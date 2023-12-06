import STATIONS_DATA from "@/assets/data/stations.json";
import { SeismogramPlotType } from "@/types/_index";
import { pWavesData } from "./earthquakePrediction";
import { socket } from "./_index";
import * as indexedDB from "@/lib/indexed-db"

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

// const seismogramTempData = new Map<string, SeismogramTempDataType>(
// 	stations.map((s) => [
// 		s.code,
// 		{
// 			channelZ: {
// 				x: [],
// 				y: [],
// 			},
// 			channelN: {
// 				x: [],
// 				y: [],
// 			},
// 			channelE: {
// 				x: [],
// 				y: [],
// 			},
// 			pWaves: [],
// 		},
// 	])
// );

const SAMPLING_RATE = 20;
const BUFFER = 20000;

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

const onmessage = (event: MessageEvent) => {
	const { station, message, creation_date, mode } = event.data;
	const stationData = stations.find((s) => s.code === station);

	if (mode === "simulation") {
		simulateStationSeismogram(stationData.code);
	} else {
		if (stationData && message === "stream") {
			if(indexedDB.db === null){
				indexedDB.openIndexedDB().then(() => {
					streamStationSeismogram(stationData.code);
				});
			}else{
				streamStationSeismogram(stationData.code);
			}
		} else if (stationData && message === "stop") {
			stopStationSeismogram(stationData.code);
		} else if (stationData && message === "lastData") {
			postMessage({
				station: stationData.code,
				data: seismogramData.get(stationData.code),
			});
		}
	}

	async function streamStationSeismogram(station: string) {
		seismogramSockets[station] = socket;
		seismogramSockets[station].on(`waves-data-${station}`, async (data: any) => {
			// loop object data
			for (const key in data) {
				const value = data[key];
				const time = parseInt(key.split("/")[1]);

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

				const tempDataFromIndexedDB = await indexedDB.readFromIndexedDB(station);

				if(tempDataFromIndexedDB !== null){
					tempData = tempDataFromIndexedDB;
				}

				tempData.channelZ.x.push(time);
				tempData.channelZ.y.push(value.Z);
				tempData.channelN.x.push(time);
				tempData.channelN.y.push(value.N);
				tempData.channelE.x.push(time);
				tempData.channelE.y.push(value.E);

				// save data to indexedDB
				indexedDB.writeToIndexedDB(station, tempData);
			}
		});

		seismogramInterval[station] = setInterval(async () => {
			const tempData = await indexedDB.readFromIndexedDB(station);
			const data = seismogramData.get(station);
			if (!tempData || tempData.channelZ.x.length === 0) return;
			const currentLength = data.currentIndex

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
						currentLength + SAMPLING_RATE
					)
				);
				newData.channelZ.y.push(
					...tempData.channelZ.y.slice(
						currentLength,
						currentLength + SAMPLING_RATE
					)
				);
				newData.channelN.x.push(
					...tempData.channelN.x.slice(
						currentLength,
						currentLength + SAMPLING_RATE
					)
				);
				newData.channelN.y.push(
					...tempData.channelN.y.slice(
						currentLength,
						currentLength + SAMPLING_RATE
					)
				);
				newData.channelE.x.push(
					...tempData.channelE.x.slice(
						currentLength,
						currentLength + SAMPLING_RATE
					)
				);
				newData.channelE.y.push(
					...tempData.channelE.y.slice(
						currentLength,
						currentLength + SAMPLING_RATE
					)
				);
				
				data.channelZ.x.push(...newData.channelZ.x);
				data.channelZ.y.push(...newData.channelZ.y);
				data.channelN.x.push(...newData.channelN.x);
				data.channelN.y.push(...newData.channelN.y);
				data.channelE.x.push(...newData.channelE.x);
				data.channelE.y.push(...newData.channelE.y);
				data.currentIndex += SAMPLING_RATE;

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

				// if the current length waves is more than 20.000, then remove the first 10.000
				if (data.channelZ.x.length > BUFFER) {
					data.channelZ.x.splice(0, BUFFER / 2);
					data.channelZ.y.splice(0, BUFFER / 2);
					data.channelN.x.splice(0, BUFFER / 2);
					data.channelN.y.splice(0, BUFFER / 2);
					data.channelE.x.splice(0, BUFFER / 2);
					data.channelE.y.splice(0, BUFFER / 2);
					data.currentIndex -= BUFFER / 2;
				}

				if(tempData.channelZ.x.length > BUFFER) {
					tempData.channelZ.x.splice(0, BUFFER / 2);
					tempData.channelZ.y.splice(0, BUFFER / 2);
					tempData.channelN.x.splice(0, BUFFER / 2);
					tempData.channelN.y.splice(0, BUFFER / 2);
					tempData.channelE.x.splice(0, BUFFER / 2);
					tempData.channelE.y.splice(0, BUFFER / 2);
				}

				seismogramData.set(station, data);
				indexedDB.writeToIndexedDB(station, tempData);

				postMessage({
					station: station,
					data: data,
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
		seismogramInterval[station] = setInterval(() => {
			const data = seismogramData.get(station);
			data.channelZ.x.push(Date.now());
			data.channelZ.y.push(Math.random() * 2000 + 500);
			data.channelN.x.push(Date.now());
			data.channelN.y.push(Math.random() * 1000 + 200);
			data.channelE.x.push(Date.now());
			data.channelE.y.push(Math.random() * 500 + 100);

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

			// if the current length waves is more than 200.000, then remove the first 100.000
			if (data.channelZ.x.length > 200000) {
				data.channelZ.x.splice(0, 100000);
				data.channelZ.y.splice(0, 100000);
				data.channelN.x.splice(0, 100000);
				data.channelN.y.splice(0, 100000);
				data.channelE.x.splice(0, 100000);
				data.channelE.y.splice(0, 100000);
			}

			seismogramData.set(station, data);

			postMessage({
				station: station,
				data: data,
			});
		}, 5000);
	}
};
addEventListener("message", onmessage);
