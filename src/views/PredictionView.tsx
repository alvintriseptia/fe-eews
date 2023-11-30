import React from "react";
import { observer } from "mobx-react";
import { PredictionController } from "@/controllers/_index";
import { IEarthquakePrediction, IMap, ISeismogram } from "@/entities/_index";
import {
	Filterbar,
	Navbar,
	PredictionCard,
	PredictionRecapContent,
} from "@/components/_index";
// import { PredictionCardProps } from "@/components/PredictionCard";
// import sampleWaves from "@/assets/data/sampleWaves.json";
import {
	PredictionRecapContentProps,
	WaveChannel,
} from "@/components/PredictionRecapContent";
import RenderIfVisible from "react-render-if-visible";

interface Props {
	controller: PredictionController;
	historyPedictions: IEarthquakePrediction[];
}

class PredictionView extends React.Component<Props> {
	state = {
		controller: {} as PredictionController,
		earthquakePrediction: {} as IEarthquakePrediction,
		map: {} as IMap,
		seismogram: {} as ISeismogram,
		navbar: {
			isLoggedIn: true,
			navLinks: [],
			totalEarthquakes: null,
			maximumMagnitude: null,
			minimumMagnitude: null,
			headerInfos: [],
			btnAuth: null,
		},
		recapPrediction: {} as PredictionRecapContentProps,
		historyPedictions: [] as IEarthquakePrediction[],
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.historyPedictions = props.historyPedictions;
	}

	componentDidMount(): void {
		if (!this.state.controller.addEarthquakePredictionLocations) return;

		console.log(this.state.historyPedictions, "historyPedictions");
		console.log(this.state.controller, "controller");
		this.state.controller.addEarthquakePredictionLocations(
			this.state.historyPedictions
		);
	}

	async detailEarthquakePrediction(earthquake: IEarthquakePrediction) {
		const seismogram =
			await this.state.controller.getSeismogramEarthquakePrediction(
				earthquake.station,
				earthquake.time_stamp
			);

		const z_channel = {
			x: [],
			y: [],
			name: "Channel Z",
			line: {
				color: "#00b7ff",
				width: 2,
			},
			xaxis: "x",
			yaxis: "y",
		};
		const n_channel = {
			x: [],
			y: [],
			name: "Channel N",
			line: {
				color: "#00FF00",
				width: 2,
			},
			xaxis: "x",
			yaxis: "y2",
		};
		const e_channel = {
			x: [],
			y: [],
			name: "Channel E",
			line: {
				color: "#FFFF00",
				width: 2,
			},
			xaxis: "x",
			yaxis: "y3",
		};
		const pwaves = [];

		seismogram.forEach((wave: ISeismogram) => {

			z_channel.x.push(wave.creation_date);
			z_channel.y.push(wave.z_channel);
			n_channel.x.push(wave.creation_date);
			n_channel.y.push(wave.n_channel);
			e_channel.x.push(wave.creation_date);
			e_channel.y.push(wave.e_channel);
		});

		
		let date = new Date(earthquake.time_stamp);
		const offset = new Date().getTimezoneOffset() * 60 * 1000;
		date.setTime(date.getTime() - offset);
		const pWaveTemp = {
			x: [date.getTime(), date.getTime()],
			y: [0, 5000],
			line: {
				color: "#FF0000",
				width: 2,
			},
			showlegend: false,
			xaxis: "x",
		};
		pwaves.push(
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
		const data: PredictionRecapContentProps = {
			...earthquake,
			z_channel,
			n_channel,
			e_channel,
			pwaves,
			magnitude: earthquake.mag,
			latitude: earthquake.lat,
			longitude: earthquake.long,
			time_stamp: earthquake.time_stamp,
			depth: earthquake.depth,
			station: earthquake.station,
			location: earthquake.location,
		};

		this.setState({ recapPrediction: data });
	}

	download() {}
	render() {
		return (
			<main className="h-screen flex flex-col overflow-hidden">
				<Navbar {...this.state.navbar} />
				<Filterbar />

				<section className="h-full grid grid-cols-12">
					<div className="h-full overflow-y-auto overflow-x-hidden col-span-5">
						<div className="flex flex-col p-4">
							<div className="flex justify-between">
								{/* <PredictionSummary {...predictionSummaryEntity} /> */}

								{/* <MagnitudeSummary /> */}
							</div>

							{this.state.historyPedictions &&
								this.state.historyPedictions.map((prediction, index) => (
									<RenderIfVisible key={index}>
										<PredictionCard
											location={prediction.location || ""}
											magnitude={prediction.mag || 0}
											latitude={prediction.lat || 0}
											longitude={prediction.long || 0}
											time={prediction.time_stamp || 0}
											depth={prediction.depth || 0}
											key={index}
											onClick={() =>
												this.detailEarthquakePrediction(prediction)
											}
										/>
									</RenderIfVisible>
								))}
						</div>
					</div>

					<div className="col-span-7">
						<div
							id="eews-history-map"
							className="w-full h-[48%] relative -z-10"
						></div>
						<div className="w-full">
							{this.state.recapPrediction &&
								this.state.recapPrediction.station && (
									<PredictionRecapContent {...this.state.recapPrediction} />
								)}
						</div>
					</div>
				</section>
			</main>
		);
	}
}

export default observer(PredictionView);
