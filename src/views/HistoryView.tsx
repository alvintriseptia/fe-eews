import React from "react";
import { observer } from "mobx-react";
import { DetectionController } from "@/controllers/_index";
import { IEarthquakeDetection, ISeismogram } from "@/entities/_index";
import {
	Filterbar,
	Navbar,
	DetectionCard,
	DetectionRecapContent,
} from "@/components/_index";
import {
	DetectionRecapContentProps as DetectionRecapContentProps,
} from "@/components/DetectionRecapContent";
import RenderIfVisible from "react-render-if-visible";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface Props {
	controller: DetectionController;
	historyDetections: IEarthquakeDetection[];
}

class HistoryView extends React.Component<Props> {
	state = {
		controller: {} as DetectionController,
		earthquakeDetection: {} as IEarthquakeDetection,
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
		recapDetection: {} as DetectionRecapContentProps,
		historyDetections: [] as IEarthquakeDetection[],
		rerender: 0,
		currentFilterStartDate: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
		currentFilterEndDate: new Date().getTime(),
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.historyDetections = props.historyDetections;

		this.handleFilter.bind(this);
		this.detailEarthquakeDetection.bind(this);
	}

	componentDidMount(): void {
		if (!this.state.controller.addEarthquakeDetectionLocations) return;

		this.state.controller
			.addEarthquakeDetectionLocations(this.state.historyDetections)
			.then((result) => {
				if (result) {
					this.setState({ historyDetection: [...result] });
				}
			});
	}

	componentDidUpdate(
		prevProps: Readonly<Props>,
		prevState: Readonly<{}>,
		snapshot?: any
	): void {
		if (prevState.rerender !== this.state.rerender) {
			this.state.controller.addEarthquakeDetectionLocations(
				this.state.historyDetections
			);
		}
	}

	async handleFilter(filter: string) {
		let start_date = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
		let end_date = new Date().getTime();
		if (filter === "current_week") {
			start_date = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
			end_date = new Date().getTime();
		} else if (filter === "current_month") {
			start_date = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
			end_date = new Date().getTime();
		} else if (filter === "last_month") {
			start_date = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
			end_date = new Date().getTime();
		} else if (filter === "this_year") {
			start_date = new Date().getTime() - 365 * 24 * 60 * 60 * 1000;
			end_date = new Date().getTime();
		}

		const newHistoryDetection =
			await this.state.controller.filterHistoryEarthquakeDetection(
				start_date,
				end_date
			);

		this.setState({
			historyDetection: [...newHistoryDetection],
			rerender: this.state.rerender + 1,
			currentFilterStartDate: start_date,
			currentFilterEndDate: end_date,
		});
	}

	async detailEarthquakeDetection(earthquake: IEarthquakeDetection) {
		const seismogram =
			await this.state.controller.getDetailEarthquakeDetection(
				earthquake.station,
				earthquake.time_stamp,
				{
					latitude: earthquake.lat,
					longitude: earthquake.long,
				}
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
		const data: DetectionRecapContentProps = {
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

		this.setState({ recapDetection: data });
	}

	download() {
		this.state.controller.exportHistoryEarthquakeDetection(
			this.state.currentFilterStartDate,
			this.state.currentFilterEndDate
		);
	}

	render() {
		return (
			<main className="h-screen flex flex-col overflow-hidden">
				<Navbar {...this.state.navbar} />
				<Filterbar onFilter={(filter) => this.handleFilter(filter)} />

				<section className="h-full grid grid-cols-12">
					<div className="h-full overflow-y-auto overflow-x-hidden col-span-5 pb-32">
						<div className="flex flex-col p-4">
							{this.state.historyDetections && (
								<div className="text-white mb-5 flex justify-between items-center">
									<div>
										<h6 className="text-xs mb-1">JUMLAH PREDIKSI</h6>
										<h4 className="text-3xl font-semibold">
											{this.state.historyDetections.length}
										</h4>
									</div>

									<button
										className="flex justify-center items-center bg-tews-dark hover:bg-tews-dark/70 transition-all duration-200 ease-in-out px-3 py-2 rounded-md font-semibold"
										onClick={() => this.download()}
									>
										<ArrowUpTrayIcon className="w-5 h-5 mr-2 font-bold" />
										Ekspor
									</button>
								</div>
							)}

							{!this.state.historyDetections ||
							this.state.historyDetections.length === 0 ? (
								<div className="flex justify-center items-center h-full">
									<h5 className="text-sm text-gray-500">Tidak ada data</h5>
								</div>
							) : (this.state.historyDetections &&
										this.state.historyDetections.map((detection, index) => {
											return (
												<RenderIfVisible key={index}>
													<DetectionCard
														location={detection.location || ""}
														magnitude={detection.mag || 0}
														latitude={detection.lat || 0}
														longitude={detection.long || 0}
														time={detection.time_stamp || 0}
														depth={detection.depth || 0}
														key={index}
														onClick={() =>
															this.detailEarthquakeDetection(detection)
														}
													/>
												</RenderIfVisible>
											);
										}
									))}
						</div>
					</div>

					<div className="col-span-7">
						<div id="tews-history-map" className={`w-full h-[48%]`}></div>
						<div className="w-full">
							{this.state.recapDetection &&
								this.state.recapDetection.station && (
									<DetectionRecapContent {...this.state.recapDetection} />
								)}
						</div>
					</div>
				</section>
			</main>
		);
	}
}

export default observer(HistoryView);
