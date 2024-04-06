import React from "react";
import { observer } from "mobx-react";
import { StyleSpecification } from "maplibre-gl";
import mapStyle from "@/assets/data/inatews_dark.json";
import {
	HistoryController,
	MainController,
	SimulationController,
	StationController,
} from "@/controllers/_index";
import {
	IEarthquakeDetection,
	IEarthquakeHistory,
	IMap,
	INotification,
	IStation,
} from "@/entities/_index";
import {
	EarthquakeHistorySidebar,
	LegendMap,
	MMIScale,
	Navbar,
	Seismogram,
	Sidebar,
	Time,
	EarthquakeRealtimeCard,
} from "@/components/_index";
import { observe } from "mobx";
import { EarthquakeRealtimeProps } from "@/components/EarthquakeRealtimeCard";
import STATIONS_DATA from "@/assets/data/stations.json";
import EarthquakeDetectionContext from "@/stores/EarthquakeDetectionContext";

interface Props {
	mode: "simulation" | "realtime";
	controller: MainController | SimulationController;
	stationController: StationController;
}

class MainView extends React.Component<Props> {
	state = {
		controller: {} as MainController | SimulationController,
		stationController: {} as StationController,
		earthquakeDetection: {} as EarthquakeRealtimeProps,
		map: {} as IMap,
		notification: {} as INotification,
		last5MEartquake: {} as IEarthquakeHistory,
		lastFeltEarthquake: {} as IEarthquakeHistory,
		weeklyEarthquake: [] as IEarthquakeHistory[],
		navbar: {
			isLoggedIn: false,
			navLinks: [],
			totalEarthquakes: 0,
			maximumMagnitude: 0,
			minimumMagnitude: 0,
			headerInfos: [],
		},
		sidebarProps: {
			latestFeltEarthquake: {} as IEarthquakeHistory,
			latestEarthquake: {} as IEarthquakeHistory,
			latestDetection: {} as IEarthquakeDetection,
		},
		earthquakeRealtimeInformation: {} as EarthquakeRealtimeProps,
		countdown: 0,
		seismogramStations: [] as IStation[],
		stations: STATIONS_DATA as IStation[],
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.stationController = props.stationController;
	}

	async componentDidMount() {
		document.querySelector("#loading_overlay").className = "block";
		const detectionController = new HistoryController();
		const weeklyEarthquake = await this.getWeeklyEarthquake();
		const latestEarthquake =
			(await this.state.controller.getLatestEarthquake()) as IEarthquakeHistory;
		const latestFeltEarthquake =
			(await this.state.controller.getLatestFeltEarthquake()) as IEarthquakeHistory;
		const latestDetection = {}
			//(await detectionController.getLatestEarthquakeDetection()) as IEarthquakeDetection;
		const style = mapStyle as StyleSpecification;
		this.state.controller.showMap({
			id: "tews-map",
			mapStyle: style,
			zoom: 5,
			initialViewState: {
				latitude: -2.600029,
				longitude: 118.015776,
			},
		});

		// Get saved stations
		const stations = await this.state.stationController.getStations();
		this.state.controller.showStations(stations);

		this.setState({
			navbar: weeklyEarthquake.navbar,
			sidebarProps: {
				latestFeltEarthquake,
				latestEarthquake,
				latestDetection,
			},
			weeklyEarthquake: weeklyEarthquake.weeklyEarthquake,
			seismogramStations: stations,
		});

		setInterval(() => {
			this.state.stationController.getStations().then((stations) => {
				this.state.controller.showStations(stations);
			});

			const latestEarthquake = this.state.controller.getLatestEarthquake();
			const latestFeltEarthquake =
				this.state.controller.getLatestFeltEarthquake();

			Promise.all([latestEarthquake, latestFeltEarthquake]).then(
				([latestEarthquake, latestFeltEarthquake]) => {
					this.setState({
						sidebarProps: {
							...this.state.sidebarProps,
							latestFeltEarthquake,
							latestEarthquake,
						},
					});
				}
			);
		}, 60000);

		setTimeout(() => {
			this.state.controller.connectEarthquakeDetection(this.props.mode);
		}, 2000);

		observe(this.state.controller, "rerender", (change) => {
			if (change.newValue) {
				this.setState({
					earthquakeRealtimeInformation: {
						earthquake: this.state.controller.earthquakeDetection,
					},
					sidebarProps: {
						...this.state.sidebarProps,
						latestDetection: this.state.controller.earthquakeDetection,
					},
				});
			}
		});

		document.querySelector("#loading_overlay").className = "hidden";
	}

	componentWillUnmount(): void {
		this.state.controller.disconnectEarthquakeDetection();
		this.state.stationController.disconnectAllSeismogram();
	}

	async getWeeklyEarthquake() {
		const weeklyEarthquake =
			(await this.state.controller.getEarthquakeWeekly()) as IEarthquakeHistory[];

		let newNavbar = {
			totalEarthquakes: 0,
			maximumMagnitude: 0,
			minimumMagnitude: 100,
		};
		newNavbar.totalEarthquakes = weeklyEarthquake.length;
		weeklyEarthquake.forEach((earthquake) => {
			if (
				newNavbar.maximumMagnitude !== undefined &&
				Number(earthquake.magnitude) > newNavbar.maximumMagnitude
			) {
				newNavbar.maximumMagnitude = Number(earthquake.magnitude);
			}

			if (
				newNavbar.minimumMagnitude !== undefined &&
				Number(earthquake.magnitude) < newNavbar.minimumMagnitude
			) {
				newNavbar.minimumMagnitude = Number(earthquake.magnitude);
			}
		});
		if (newNavbar.minimumMagnitude == 100) newNavbar.minimumMagnitude = 0;

		return {
			navbar: newNavbar,
			weeklyEarthquake,
		};
	}

	render() {
		return (
			<main className="h-screen flex flex-col overflow-hidden">
				{/* NAVBAR */}
				<Navbar {...this.state.navbar} />

				{/* CONTENT */}
				<section className="flex h-full relative overflow-hidden">
					<Sidebar {...this.state.sidebarProps} />

					<EarthquakeHistorySidebar
						weeklyEarthquake={this.state.weeklyEarthquake}
					/>

					<LegendMap />

					<div className="flex flex-col w-full">
						<div className="relative h-full">
							<div className="w-full h-full" id="tews-map"></div>

							<section className="absolute bottom-3 left-2 z-20">
								{this.state.earthquakeRealtimeInformation &&
									this.state.earthquakeRealtimeInformation.earthquake
										?.time_stamp &&
									this.state.earthquakeRealtimeInformation.earthquake
										?.title && (
										<EarthquakeRealtimeCard
											earthquake={
												this.state.earthquakeRealtimeInformation.earthquake
											}
										/>
									)}
							</section>

							<section className="absolute bottom-4 left-0 right-4 z-20 text-right">
								<Time />
							</section>

							<section className="absolute bottom-20 right-4 z-20 text-right">
								<MMIScale />
							</section>
						</div>
					</div>
				</section>
			</main>
		);
	}
}

export default observer(MainView);
