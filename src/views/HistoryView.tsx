import React from "react";
import { observer } from "mobx-react";
import { HistoryController } from "@/controllers/_index";
import { IEarthquakeDetection, ISeismogram } from "@/entities/_index";
import {
	Filterbar,
	Navbar,
	DetectionCard,
	DetectionRecapContent,
} from "@/components/_index";
import { DetectionRecapContentProps as DetectionRecapContentProps } from "@/components/DetectionRecapContent";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import mapStyle from "@/assets/data/inatews_dark.json";
import { StyleSpecification } from "maplibre-gl";

interface Props {
	controller: HistoryController;
}

class HistoryView extends React.Component<Props> {
	state = {
		controller: {} as HistoryController,
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
		totalDetection: 0,
		currentDateCursor: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
		hasMore: false,
		currentFilterStartDate: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
		currentFilterEndDate: new Date().getTime(),
		offsetHours: new Date().getTimezoneOffset() / 60,
	};
	isLoading = false;
	scrollerRef = React.createRef<HTMLDivElement>();

	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.handleFilter.bind(this);
		this.detailEarthquakeDetection.bind(this);
		this.loadMore.bind(this);
		this.handleScroll.bind(this);
	}

	async componentDidMount() {
		const style = mapStyle as StyleSpecification;
		this.state.controller.showMap({
			id: "tews-history-map",
			mapStyle: style,
			zoom: 5,
			initialViewState: {
				latitude: -2.600029,
				longitude: 118.015776,
			},
		});

		const start_date = new Date().getTime() - 1000 * 60 * 60 * 24 * 7; // 7 days ago
		const end_date = new Date().getTime();
		const response = await this.state.controller.getHistoryEarthquakeDetection(
			start_date,
			end_date
		);

		this.setState({
			historyDetections: response.data,
			totalDetection: response.total,
			currentFilterStartDate: start_date,
			currentFilterEndDate: end_date,
			hasMore: response.total > 20 ? true : false,
		});
	}

	handleScroll() {
		const scroller = this.scrollerRef.current;
		if (
			Math.floor(scroller.scrollHeight - scroller.scrollTop) - 200 <=
				scroller.clientHeight &&
			this.state.hasMore
		) {
			this.loadMore();
		}
	}

	async handleFilter(start_date: number, end_date: number) {
		const newHistoryDetection =
			await this.state.controller.getHistoryEarthquakeDetection(
				start_date,
				end_date
			);

		this.setState({
			historyDetections: [...newHistoryDetection.data],
			totalDetection: newHistoryDetection.total,
			currentDateCursor: start_date,
			currentFilterStartDate: start_date,
			currentFilterEndDate: end_date,
			hasMore: newHistoryDetection.total > 20 ? true : false,
		});
	}

	async detailEarthquakeDetection(earthquake: IEarthquakeDetection) {
		this.isLoading = true;
		const seismogram = await this.state.controller.getDetailEarthquakeDetection(
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

	async loadMore() {
		if (this.isLoading) return;
		this.isLoading = true;
		const newCurrentDate = new Date(
			this.state.historyDetections[
				this.state.historyDetections.length - 1
			].time_stamp
		);
		newCurrentDate.setHours(newCurrentDate.getHours() - this.state.offsetHours);

		if (newCurrentDate.getTime() + 10 > this.state.currentFilterEndDate) {
			this.isLoading = false;
			this.setState({ hasMore: false });
			return;
		} else {
			const newHistoryDetection =
				await this.state.controller.getHistoryEarthquakeDetection(
					newCurrentDate.getTime() + 10,
					this.state.currentFilterEndDate
				);
			if (newHistoryDetection.data.length === 0) {
				this.setState({ hasMore: false });
			} else {
				this.setState({
					historyDetections: [
						...this.state.historyDetections,
						...newHistoryDetection.data,
					],
					currentDateCursor: newCurrentDate.getTime() + 10,
					hasMore: newHistoryDetection.total > 20 ? true : false,
				});
			}
			this.isLoading = false;
		}
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
				<Filterbar onFilter={(...args) => this.handleFilter(...args)} />

				<section className="h-full grid grid-cols-12">
					<div
						className="h-full overflow-y-auto overflow-x-hidden col-span-5 pb-32"
						ref={this.scrollerRef}
						onScroll={() => this.handleScroll()}
					>
						<div className="flex flex-col p-4">
							{this.state.historyDetections && (
								<div className="text-white mb-5 flex justify-between items-center">
									<div>
										<h6 className="text-xs mb-1">JUMLAH DETEKSI</h6>
										<h4 className="text-3xl font-semibold">
											{this.state.totalDetection}
										</h4>
									</div>

									{this.state.historyDetections.length > 0 && (
										<button
											className="flex justify-center items-center bg-tews-dark hover:bg-tews-dark/70 transition-all duration-200 ease-in-out px-3 py-2 rounded-md font-semibold"
											onClick={() => this.download()}
										>
											<ArrowUpTrayIcon className="w-5 h-5 mr-2 font-bold" />
											Ekspor
										</button>
									)}
								</div>
							)}

							{!this.state.historyDetections ||
							this.state.historyDetections.length === 0 ? (
								<div className="flex justify-center items-center h-full">
									<h5 className="text-sm text-gray-500">Tidak ada data</h5>
								</div>
							) : (
								this.state.historyDetections && (
									<>
										{this.state.historyDetections.map((detection, index) => {
											return (
												<DetectionCard
													key={index}
													location={detection.location || ""}
													magnitude={detection.mag || 0}
													latitude={detection.lat || 0}
													longitude={detection.long || 0}
													time={detection.time_stamp || 0}
													depth={detection.depth || 0}
													onClick={() =>
														this.detailEarthquakeDetection(detection)
													}
												/>
											);
										})}

										{this.state.hasMore && (
											<div className="flex justify-center items-center my-8">
												<h5 className="text-sm text-gray-100">
													Sedang memuat...
												</h5>
											</div>
										)}
									</>
								)
							)}
						</div>
					</div>

					<div className="col-span-7 relative">
						<div id="tews-history-map" className={`w-full h-full`}></div>
						<div className={`w-full absolute bottom-0 right-0 z-[9999] h-[450px] bg-tews-cinder transition-all duration-200 ease-in-out
							${
								this.state.recapDetection &&
								this.state.recapDetection.station
									? "translate-y-0"
									: "translate-y-full"
							}
						`}>
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
