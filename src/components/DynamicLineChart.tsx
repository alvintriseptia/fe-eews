import React from "react";
import { ISeismogram } from "@/entities/_index";
import SeismogramContext from "@/stores/SeismogramContext";
import dynamic from "next/dynamic";
import { Layout, PlotRelayoutEvent } from "plotly.js";

const Plot = dynamic(
	() => import("react-plotly.js").then((mod) => mod.default),
	{
		ssr: false,
	}
);

type pWaveProps = {
	time_stamp: string;
};

interface Props {
	station?: string;
	pWave?: pWaveProps;
}

export default class DynamicLineChart extends React.Component<Props> {
	static contextType = SeismogramContext;

	state = {
		station: "",
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
				color:"#FFFF00",
				width: 2,
			},
			xaxis: "x",
			yaxis: "y3",
		} as any,
		pWaves: [],
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
				range: [-1000, 7000],
				fixedrange: true,
			},
			yaxis2: {
				type: "linear",
				color: "#fff",
				range: [-1000, 7000],
				fixedrange: true,
			},
			yaxis3: {
				type: "linear",
				color: "#fff",
				range: [-1000, 7000],
				fixedrange: true,
			},
			height: 400,
			width: 480,
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
		revision: 0,
		userDefinedRange: null,
	};

	constructor(props: Props) {
		super(props);
		this.state.station = props.station;
	}

	componentDidMount() {
		setInterval(this.simulateSeismogram, 1000);
		const seismogramWorker = this.context as Worker | null;

		const handleSeismogramWorker = (event: MessageEvent) => {
			const { station, seismogram } = event.data;
			if (station !== this.state.station) {
				return; // Ignore messages not meant for this station
			}
			this.setState((prevState) => ({
				waveData: [...prevState.waveData, ...seismogram],
			}));
		};

		seismogramWorker?.addEventListener("message", handleSeismogramWorker);

		return () => {
			seismogramWorker?.removeEventListener("message", handleSeismogramWorker);
		};
	}
	componentDidUpdate(prevProps: Props) {
		//context is updated
		if (prevProps.pWave !== this.props.pWave) {
			const pWaveTemp = {
				x: [] as Array<number>,
				y: [] as Array<number>,
				line: {
					color: "#FF0000",
					width: 2,
				},
				showlegend: false,
			};
			const { pWave: pWaveProps } = this.props;

			if (pWaveProps) {
				const date = new Date(pWaveProps.time_stamp);
				pWaveTemp.x.push(date.getTime());
				pWaveTemp.y.push(0);
				pWaveTemp.x.push(date.getTime());
				pWaveTemp.y.push(6000);

				this.setState({
					pWaves: [...this.state.pWaves, pWaveTemp],
				});
			}
		}
	}
	simulateSeismogram = () => {
		const { channelZ,channelN, channelE, waveData, samplingRate, layout, userDefinedRange } =
			this.state;
		if (!waveData || waveData.length === 0) {
			return;
		} else {
			console.log(waveData, this.state.station);
		}

		const length =
			samplingRate > waveData.length ? waveData.length : samplingRate;
		const newData = waveData.slice(0, length);

		const tempZ: number[] = [];
		const tempN: number[] = [];
		const tempE: number[] = [];
		const tempX: number[] = [];
		for (let i = 0; i < length; i++) {
			const data = newData[i];
			//if data.creation_date < last channelZ.x or data.creation_date
			if (
				data.creation_date < channelZ.x[channelZ.x.length - 1] ||
				isNaN(data.creation_date)
			) {
				continue;
			}

			tempX.push(data.creation_date);
			tempZ.push(data.z_channel);
			tempN.push(data.n_channel);
			tempE.push(data.e_channel);
		}

		channelZ.x = [...channelZ.x, ...tempX];
		channelZ.y = [...channelZ.y, ...tempZ];
		channelN.x = [...channelN.x, ...tempX];
		channelN.y = [...channelN.y, ...tempN];
		channelE.x = [...channelE.x, ...tempX];
		channelE.y = [...channelE.y, ...tempE];

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
			currentIndex: length,
			waveData: waveData.slice(length),
			channelZ,
			channelN,
			channelE,
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
