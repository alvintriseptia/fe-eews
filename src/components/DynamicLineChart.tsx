import React from "react";
import { IEarthquakeDetection, ISeismogram } from "@/entities/_index";
import dynamic from "next/dynamic";
import { Layout, PlotRelayoutEvent } from "plotly.js";
import { SeismogramDataType } from "@/workers/seismogram";
import StationController from "@/controllers/StationController";
import { observe } from "mobx";

const Plot = dynamic(
	() => import("react-plotly.js").then((mod) => mod.default),
	{
		ssr: false,
	}
);

interface Props {
	station?: string;
	width?: number | string;
	height?: number | string;
	showTitle?: boolean;
}

export default class DynamicLineChart extends React.Component<Props> {
	state = {
		station: "",
		showTitle: true,
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
				range: [Date.now() - 60000, Date.now()],
				autorange: false,
				showspikes: false,
			},
			yaxis: {
				type: "linear",
				color: "#fff",
				// range: [-1000, 3000],
			},
			yaxis2: {
				type: "linear",
				color: "#fff",
				// range: [-1000, 3000],
			},
			yaxis3: {
				type: "linear",
				color: "#fff",
				// range: [-1000, 3000],
			},
			yaxis4: {
				type: "linear",
				color: "#fff",
				// range: [-1000, 3000],
				fixedrange: true,
				overlaying: "y",
				ticks: "",
				showgrid: false,
				zeroline: false,
				showticklabels: false,
			},
			yaxis5: {
				type: "linear",
				color: "#fff",
				// range: [-1000, 3000],
				fixedrange: true,
				overlaying: "y2",
				ticks: "",
				showgrid: false,
				zeroline: false,
				showticklabels: false,
			},
			yaxis6: {
				type: "linear",
				color: "#fff",
				// range: [-1000, 3000],
				fixedrange: true,
				overlaying: "y3",
				ticks: "",
				showgrid: false,
				zeroline: false,
				showticklabels: false,
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
		revision: 0,
		userDefinedRange: null,
	};

	constructor(props: Props) {
		super(props);
		this.state.station = props.station;

		if (props.showTitle !== undefined && props.showTitle !== null) {
			this.state.showTitle = props.showTitle;
		}

		if (props.width) {
			if (typeof props.width === "number") {
				this.state.layout.width = props.width;
			} else if (props.width == "100%") {
				this.state.layout.width = window.innerWidth - 100;
			}
		}
		if (props.height) {
			if (typeof props.height === "number") {
				this.state.layout.height = props.height;
			} else if (props.height == "100%") {
				this.state.layout.height = window.innerHeight - 100;
			}
		}
	}

	componentDidMount() {
		if (this.props.station) {
			const stationController = StationController.getInstance();

			stationController.getLastSeismogramData(this.props.station);
			const seismogram = stationController.seismograms.get(this.props.station);
			observe(seismogram, "rerender", (change) => {
				if (change.newValue > 0 && seismogram.seismogramData) {
					this.simulateSeismogram(seismogram.seismogramData);
				}
			});
		}
	}

	componentDidUpdate(prevProps: Props, prevState: any) {
		const { userDefinedRange } = this.state;
		if (prevState.userDefinedRange !== userDefinedRange) {
			this.getHistoryData(
				this.props.station,
				new Date(userDefinedRange[0]).getTime(),
				new Date(userDefinedRange[1]).getTime()
			);
		}
	}

	getHistoryData(station: string, start: number, end: number){
		const stationController = StationController.getInstance();
		stationController.getHistorySeismogramData(station, start, end);
	}

	simulateSeismogram(data: SeismogramDataType) {
		const { channelZ, channelN, channelE, layout, userDefinedRange } =
			this.state;
		if (userDefinedRange) {
			layout.xaxis.range = userDefinedRange;
		} else {
			if (channelZ.x.length > 0) {
				const last = channelZ.x[channelZ.x.length - 1];
				const first = channelZ.x[0];
				layout.xaxis.range = [first, last];
			} else {
				const now = Date.now();
				layout.xaxis.range = [now - 60000, now];
			}
		}

		this.setState({
			revision: this.state.revision + 1,
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
	}

	handleRelayout = (event: PlotRelayoutEvent) => {
		if (event["xaxis.showspikes"] === false) {
			const { channelZ, layout } = this.state;
			if (channelZ.length > 0) {
				const last = channelZ.x[channelZ.x.length - 1];
				const first = channelZ.x[0];
				layout.xaxis.range = [first, last];
				this.setState({
					revision: this.state.revision + 1,
					userDefinedRange: null,
				});
				layout.datarevision = this.state.revision + 1;
			} else {
				const now = Date.now();
				layout.xaxis.range = [now - 60000, now];
				this.setState({
					revision: this.state.revision + 1,
					userDefinedRange: null,
				});
				layout.datarevision = this.state.revision + 1;
			}
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
				className={`p-4 pt-0 relative transition-all duration-200 ease-in-out -translate-y-20`}
				style={{
					height: this.state.layout.height,
					width: this.state.layout.width,
				}}
			>
				{this.state.showTitle && (
					<h3 className="text-white text-lg font-semibold mb-2 text-center relative translate-y-20 z-10">
						Sensor {this.state.station}
					</h3>
				)}
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
