import React from "react";
import { IEarthquakePrediction, ISeismogram } from "@/entities/_index";
import dynamic from "next/dynamic";
import { Layout, PlotRelayoutEvent } from "plotly.js";
import { SeismogramDataType } from "@/workers/seismogram";
import SeismogramContext from "@/stores/SeismogramContext";

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
	static contextType = SeismogramContext;

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
				range: [-1000, 3000],
				fixedrange: true,
			},
			yaxis2: {
				type: "linear",
				color: "#fff",
				range: [-1000, 3000],
				fixedrange: true,
			},
			yaxis3: {
				type: "linear",
				color: "#fff",
				range: [-1000, 3000],
				fixedrange: true,
			},
			yaxis4: {
				type: "linear",
				color: "#fff",
				range: [-1000, 3000],
				fixedrange: true,
				overlaying: "y",
			},
			yaxis5: {
				type: "linear",
				color: "#fff",
				range: [-1000, 3000],
				fixedrange: true,
				overlaying: "y2",
			},
			yaxis6: {
				type: "linear",
				color: "#fff",
				range: [-1000, 3000],
				fixedrange: true,
				overlaying: "y3",
			},
			height: 500,
			width: 500,
			paper_bgcolor: "#0D121C",
			plot_bgcolor: "transparent",
			grid: {
				rows: 3,
				columns: 1,
				subplots: ["xy", "xy2", "xy3"],
				roworder: "top to bottom",
				xgap: 0.05,
				ygap: 32,
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
		let isMounted = true;
		const seismogramWorker = this.context as any as Worker | null;

		const handleSeismogramWorker = (event: MessageEvent) => {
			const { station, data } = event.data;
			if (station !== this.state.station) {
				return; // Ignore messages not meant for this station
			}
			if (!isMounted || !data) {
				return; // Ignore messages if component is unmounted
			}
			
			const { channelZ, channelN, channelE, layout, userDefinedRange } =
				this.state;
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
					x: data.channelZ.x,
					y: data.channelZ.y,
				},
				channelN: {
					...channelN,
					x: data.channelN.x,
					y: data.channelN.y,
				},
				channelE: {
					...channelE,
					x: data.channelE.x,
					y: data.channelE.y,
				},
				pWaves: data.pWaves,
			});
			layout.datarevision = this.state.revision + 1;
		};

		if (this.state.channelZ.x.length === 0) {
			seismogramWorker?.postMessage({
				station: this.state.station,
				message: "lastData",
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
	// 		earthquakePrediction.time_stamp !==
	// 			this.state.prevContextValue?.time_stamp
	// 	) {
	// 		console.log(
	// 			earthquakePrediction,
	// 			"earthquakePrediction",
	// 			this.state.station
	// 		);

	// 		// //if the creation date is less than the last data, then directly add it to the pWaves

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

	// 		const date = new Date(earthquakePrediction.time_stamp);
	// 		pWaveTemp.x.push(date.getTime());
	// 		pWaveTemp.y.push(0);
	// 		pWaveTemp.x.push(date.getTime());
	// 		pWaveTemp.y.push(6000);

	// 		this.setState((prevState: any) => ({
	// 			pWaves: [
	// 				...prevState.pWaves,
	// 				{
	// 					...pWaveTemp,
	// 					yaxis: "y4",
	// 				},
	// 				{
	// 					...pWaveTemp,
	// 					yaxis: "y5",
	// 				},
	// 				{
	// 					...pWaveTemp,
	// 					yaxis: "y6",
	// 				},
	// 			],
	// 			prevContextValue: earthquakePrediction,
	// 		}));
	// 	}
	// }

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
				className={`p-4 pt-0 relative h-[500px] transition-all duration-200 ease-in-out -translate-y-20`}
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
