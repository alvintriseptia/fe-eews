import React from "react";
import { IEarthquakePrediction, ISeismogram } from "@/entities/_index";
import dynamic from "next/dynamic";
import { Layout, PlotRelayoutEvent } from "plotly.js";
import MainContext from "@/stores/MainContext";
import { SeismogramDataType } from "@/workers/seismogram";

const Plot = dynamic(
	() => import("react-plotly.js").then((mod) => mod.default),
	{
		ssr: false,
	}
);

interface Props {
	station?: string;
}

export default class DynamicLineChart extends React.Component<Props> {
	static contextType = MainContext;

	state = {
		station: "",
		prevContextValue: null,
		waveData: [] as ISeismogram[],
		samplingRate: 80,
		channelZ: {
			x: [],
			y: [],
			name: "Channel Z",
			line: {
				color: "#00b7ff",
				width: 2,
			},
			xaxis: "x",
			yaxis: "y",
		} as any,
		channelN: {
			x: [],
			y: [],
			name: "Channel N",
			line: {
				color: "#00FF00",
				width: 2,
			},
			xaxis: "x",
			yaxis: "y2",
		} as any,
		channelE: {
			x: [],
			y: [],
			name: "Channel E",
			line: {
				color: "#FFFF00",
				width: 2,
			},
			xaxis: "x",
			yaxis: "y3",
		} as any,
		pWaves: [] as any[],
		layout: {
			datarevision: 0,
			xaxis: {
				type: "date",
				color: "#fff",
				range: [Date.now() - 30000, Date.now()],
			},
			yaxis: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
			},
			yaxis2: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
			},
			yaxis3: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
			},
			yaxis4: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
				overlaying: "y",
			},
			yaxis5: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
				overlaying: "y2",
			},
			yaxis6: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
				overlaying: "y3",
			},
			height: 400,
			width: 500,
			paper_bgcolor: "#0D121C",
			plot_bgcolor: "transparent",
			grid: {
				rows: 3,
				columns: 1,
				subplots: ["xy", "xy2", "xy3"],
				roworder: "top to bottom",
				xgap: 0.05,
				ygap: 0.05,
				xside: "bottom plot",
				yside: "left plot",
			},
		} as Partial<Layout>,
		earthquakePredictions: [] as IEarthquakePrediction[],
		revision: 0,
		userDefinedRange: null,
	};

	constructor(props: Props) {
		super(props);
		this.state.station = props.station;
	}

	componentDidMount() {
		let isMounted = true
		const seismogramWorker = (this.context as any)
			?.seismogramWorker as Worker | null;

		const handleSeismogramWorker = (event: MessageEvent) => {
			const { station, data } = event.data;
			// console.log(data, Date.now())
			if (station !== this.state.station) {
				return; // Ignore messages not meant for this station
			}
			if (!isMounted) {
				return; // Ignore messages if component is unmounted
			}
			this.simulateSeismogram(data);
		};

		if(this.state.channelZ.x.length === 0) {
			seismogramWorker?.postMessage({
				station: this.state.station,
				message: "lastData"
			});
		}

		seismogramWorker?.addEventListener("message", handleSeismogramWorker);

		return () => {
			seismogramWorker?.removeEventListener("message", handleSeismogramWorker);
		};
	}
	// componentDidUpdate(prevProps: Props) {
	// 	//context is updated
	// 	const earthquakePrediction = (this.context as any)
	// 		?.earthquakePrediction as IEarthquakePrediction | null;
	// 	if (
	// 		earthquakePrediction &&
	// 		earthquakePrediction.station === this.state.station &&
	// 		earthquakePrediction.creation_date !==
	// 			this.state.prevContextValue?.creation_date
	// 	) {
	// 		console.log(
	// 			earthquakePrediction,
	// 			"earthquakePrediction",
	// 			this.state.station
	// 		);

	// 		// //if the creation date is less than the last data, then directly add it to the pWaves
	// 		// if (
	// 		// 	this.state.channelZ.x[this.state.channelZ.x.length - 1] >
	// 		// 	earthquakePrediction.creation_date
	// 		// ) {
	// 			// const pWaveTemp = {
	// 			// 	x: [] as Array<number>,
	// 			// 	y: [] as Array<number>,
	// 			// 	line: {
	// 			// 		color: "#FF0000",
	// 			// 		width: 2,
	// 			// 	},
	// 			// 	showlegend: false,
	// 			// 	xaxis: "x",
	// 			// };

	// 			// const date = new Date(earthquakePrediction.creation_date);
	// 			// pWaveTemp.x.push(date.getTime());
	// 			// pWaveTemp.y.push(0);
	// 			// pWaveTemp.x.push(date.getTime());
	// 			// pWaveTemp.y.push(6000);

	// 			this.setState((prevState: any) => ({
	// 				pWaves: [
	// 					...prevState.pWaves,
	// 					{
	// 						...pWaveTemp,
	// 						yaxis: "y4",
	// 					},
	// 					{
	// 						...pWaveTemp,
	// 						yaxis: "y5",
	// 					},
	// 					{
	// 						...pWaveTemp,
	// 						yaxis: "y6",
	// 					},
	// 				],
	// 				prevContextValue: earthquakePrediction,
	// 			}));
	// 		// } else {
	// 		// 	this.setState((prevState: any) => ({
	// 		// 		earthquakePredictions: [
	// 		// 			...prevState.earthquakePredictions,
	// 		// 			earthquakePrediction,
	// 		// 		],
	// 		// 		prevContextValue: earthquakePrediction,
	// 		// 	}));
	// 		// }
	// 	}
	// }
	simulateSeismogram = (seismogram: SeismogramDataType) => {
		const {
			channelZ,
			channelN,
			channelE,
			layout,
			userDefinedRange,
		} = this.state;
		// if (!waveData || waveData.length === 0) {
		// 	return;
		// }

		// const length =
		// 	samplingRate > waveData.length ? waveData.length : samplingRate;
		// const newData = waveData.slice(0, length);

		// const tempZ: number[] = [];
		// const tempN: number[] = [];
		// const tempE: number[] = [];
		// const tempX: number[] = [];
		// const removedEarthquakePredictions: number[] = [];
		// for (let i = 0; i < length; i++) {
		// 	const data = newData[i];
		// 	//if data.creation_date < last channelZ.x or data.creation_date
		// 	if (
		// 		data.creation_date < channelZ.x[channelZ.x.length - 1] ||
		// 		isNaN(data.creation_date)
		// 	) {
		// 		continue;
		// 	}

		// 	tempX.push(data.creation_date);
		// 	tempZ.push(data.z_channel);
		// 	tempN.push(data.n_channel);
		// 	tempE.push(data.e_channel);

		// 	// Check if earthquake prediction is available, and the time is same as the current data
		// 	const earthquakePredictionIndex = earthquakePredictions.findIndex(
		// 		(prediction) => prediction.creation_date <= data.creation_date
		// 	);

		// 	if (earthquakePredictionIndex !== -1) {
		// 		const earthquakePrediction =
		// 			earthquakePredictions[earthquakePredictionIndex];
		// 		removedEarthquakePredictions.push(earthquakePredictionIndex);
		// 		const pWaveTemp = {
		// 			x: [] as Array<number>,
		// 			y: [] as Array<number>,
		// 			line: {
		// 				color: "#FF0000",
		// 				width: 2,
		// 			},
		// 			showlegend: false,
		// 			xaxis: "x",
		// 		};

		// 		const date = new Date(earthquakePrediction.creation_date);
		// 		pWaveTemp.x.push(date.getTime());
		// 		pWaveTemp.y.push(0);
		// 		pWaveTemp.x.push(date.getTime());
		// 		pWaveTemp.y.push(6000);

		// 		pWaves.push(
		// 			{
		// 				...pWaveTemp,
		// 				yaxis: "y4",
		// 			},
		// 			{
		// 				...pWaveTemp,
		// 				yaxis: "y5",
		// 			},
		// 			{
		// 				...pWaveTemp,
		// 				yaxis: "y6",
		// 			}
		// 		);
		// 	}
		// // }

		// channelZ.x = [...channelZ.x, seismogram.creation_date];
		// channelZ.y = [...channelZ.y, seismogram.z_channel];
		// channelN.x = [...channelN.x, seismogram.creation_date];
		// channelN.y = [...channelN.y, seismogram.n_channel];
		// channelE.x = [...channelE.x, seismogram.creation_date];
		// channelE.y = [...channelE.y, seismogram.e_channel];

		// // if the current length waves is more than 200.000, then remove the first 100.000
		// if (channelZ.x.length > 200000) {
		// 	channelZ.x = channelZ.x.slice(100000);
		// 	channelZ.y = channelZ.y.slice(100000);
		// 	channelN.x = channelN.x.slice(100000);
		// 	channelN.y = channelN.y.slice(100000);
		// 	channelE.x = channelE.x.slice(100000);
		// 	channelE.y = channelE.y.slice(100000);
		// }

		// Use user-defined range if available, otherwise calculate a new range
		if (userDefinedRange) {
			layout.xaxis.range = userDefinedRange;
		} else {
			const now = Date.now();
			const last = channelZ.x[channelZ.x.length - 1];
			const first = channelZ.x[0];
			const diff = last - first;
			if (diff > 30000) {
				layout.xaxis.range = [now - 30000, now];
			} else {
				layout.xaxis.range = [first, last];
			}
		}

		this.setState({
			revision: this.state.revision + 1,
			// currentIndex: length,
			// waveData: waveData.slice(length),
			channelZ: {
				...channelZ,
				x: seismogram.channelZ.x,
				y: seismogram.channelZ.y,
			},
			channelN: {
				...channelN,
				x: seismogram.channelN.x,
				y: seismogram.channelN.y,
			},
			channelE: {
				...channelE,
				x: seismogram.channelE.x,
				y: seismogram.channelE.y,
			},
			pWaves: seismogram.pWaves,
			// earthquakePredictions: earthquakePredictions.filter(
				// (_, index) => !removedEarthquakePredictions.includes(index)
			// ),
		});
		layout.datarevision = this.state.revision + 1;
	};
	handleRelayout = (event: PlotRelayoutEvent) => {
		if (event["xaxis.showspikes"] === false) {
			const { channelZ, layout } = this.state;
			const now = Date.now();
			const last = channelZ.x[channelZ.x.length - 1];
			const first = channelZ.x[0];
			const diff = last - first;
			if (diff > 30000) {
				layout.xaxis.range = [now - 30000, now];
			} else {
				layout.xaxis.range = [first, last];
			}
			this.setState({
				revision: this.state.revision + 1,
				userDefinedRange: null,
			});
			layout.datarevision = this.state.revision + 1;
		}
		// Check if the x-axis range has been manually adjusted by the user
		else if (event["xaxis.range[0]"] && event["xaxis.range[1]"]) {
			this.setState({
				userDefinedRange: [event["xaxis.range[0]"], event["xaxis.range[1]"]],
			});
		}
	};
	render() {
		return (
			<div
				className={`p-4 pt-0 relative h-[400px] transition-all duration-200 ease-in-out -translate-y-20`}
			>
				<h3 className="text-white text-lg font-semibold mb-2 text-center relative translate-y-20 z-10">
					Sensor {this.state.station}
				</h3>
				<div>
					<Plot
						data={[
							this.state.channelZ,
							this.state.channelN,
							this.state.channelE,
							...this.state.pWaves,
						]}
						layout={this.state.layout}
						revision={this.state.revision}
						style={{ width: "100%", height: "100%" }}
						onRelayout={this.handleRelayout}
					/>
				</div>
			</div>
		);
	}
}
