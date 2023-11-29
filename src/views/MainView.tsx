import React from "react";
import { observer } from "mobx-react";
import { StyleSpecification } from "maplibre-gl";
import mapStyle from "@/assets/data/dataviz_dark.json";
import { MainController, SimulationController, StationController } from "@/controllers/_index";
import {
	IExternalSource,
	IMap,
	INotification,
	ISeismogram,
	IStation,
} from "@/entities/_index";
import {
	EarthquakeHistorySidebar,
	Navbar,
	Seismogram,
	Sidebar,
} from "@/components/_index";
import { NavbarProps } from "@/components/Navbar";
import { observe } from "mobx";
import { EarthquakeRealtimeProps } from "@/components/Sidebar";
import STATIONS_DATA from "@/assets/data/stations.json";
import EarthquakePredictionContext from "@/stores/EarthquakePredictionContext";

interface Props {
	mode: "simulation" | "realtime";
	controller: MainController | SimulationController;
	stationController: StationController;
	weeklyEarthquake: IExternalSource[];
	navbar: NavbarProps;
	sidebarProps: {
		latestFeltEarthquake: IExternalSource;
		latestEarthquake: IExternalSource;
		earthquakePrediction: EarthquakeRealtimeProps;
	};
}

class MainView extends React.Component<Props> {
	state = {
		controller: {} as MainController | SimulationController,
		stationController: {} as StationController,
		earthquakePrediction: {} as EarthquakeRealtimeProps,
		map: {} as IMap,
		notification: {} as INotification,
		seismogram: [] as ISeismogram[],
		last5MEartquake: {} as IExternalSource,
		lastFeltEarthquake: {} as IExternalSource,
		weeklyEarthquake: [] as IExternalSource[],
		navbar: {
			isLoggedIn: false,
			navLinks: [],
			totalEarthquakes: 0,
			maximumMagnitude: 0,
			minimumMagnitude: 100,
			headerInfos: [],
			btnAuth: null,
		},
		sidebarProps: {
			latestFeltEarthquake: {} as IExternalSource,
			latestEarthquake: {} as IExternalSource,
			earthquakePrediction: {} as EarthquakeRealtimeProps,
		},
		countdown: 0,
		stations: STATIONS_DATA as IStation[],
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.stationController = props.stationController;
		this.state.weeklyEarthquake = props.weeklyEarthquake;
		this.state.navbar = props.navbar;
		this.state.sidebarProps = props.sidebarProps;
	}

	componentDidUpdate(prevProps: Readonly<Props>): void {
		if (prevProps.weeklyEarthquake !== this.props.weeklyEarthquake) {
			this.setState({ weeklyEarthquake: this.props.weeklyEarthquake });
		}
	}

	componentDidMount(): void {
		const style = mapStyle as StyleSpecification;
		this.state.controller.showMap({
			id: "eews-map",
			mapStyle: style,
			zoom: 5,
			initialViewState: {
				latitude: -2.600029,
				longitude: 118.015776,
			},
		});

		// Get saved stations
		const stations = this.state.stationController.getStations();
		this.state.controller.showStations(stations);
		setTimeout(() => {
			this.state.controller.connectEarthquakePrediction();
		}, 2000);

		observe(this.state.controller, "earthquakePrediction", (change) => {
			if (change.newValue) {
				this.setState({
					sidebarProps: {
						...this.state.sidebarProps,
						earthquakePrediction: {
							earthquake: change.newValue,
						},
					},
				});
			}
		});

		this.state.stationController.connectSeismogram(this.props.mode);
	}

	componentWillUnmount(): void {
		this.state.controller.disconnectEarthquakePrediction();
	}

	render() {
		return (
			<main className="h-screen flex flex-col overflow-hidden">
				{/* NAVBAR */}
				<Navbar {...this.state.navbar} />

				{/* CONTENT */}
				<section className="flex h-full relative overflow-hidden">
					<EarthquakeHistorySidebar
						weeklyEarthquake={this.state.weeklyEarthquake}
					/>

					<EarthquakePredictionContext.Provider
						value={this.state.sidebarProps.earthquakePrediction?.earthquake}
					>
						<Seismogram
							seismogramStations={this.state.stations.map((s) => s.code)}
						/>
					</EarthquakePredictionContext.Provider>

					<Sidebar {...this.state.sidebarProps} />

					<div className="w-full h-full" id="eews-map"></div>
				</section>
			</main>
		);
	}
}

export default observer(MainView);
