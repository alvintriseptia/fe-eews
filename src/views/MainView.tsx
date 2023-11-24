import React from "react";
import { observer } from "mobx-react";
import { StyleSpecification } from "maplibre-gl";
import mapStyle from "@/assets/data/dataviz_dark.json";
import { MainController, StationController } from "@/controllers/_index";
import {
	IEarthquakePrediction,
	IExternalSource,
	IMap,
	INotification,
	ISeismogram,
} from "@/entities/_index";
import { Navbar, Sidebar } from "@/components/_index";

interface Props {
	controller: MainController;
	stationController: StationController;
}

class MainView extends React.Component<Props> {
	state = {
		controller: {} as MainController,
		stationController: {} as StationController,
		earthquakePrediction: {} as IEarthquakePrediction,
		map: {} as IMap,
		notification: {} as INotification,
		seismogram: [] as ISeismogram[],
		last5MEartquake: {} as IExternalSource,
		lastFeltEarthquake: {} as IExternalSource,
		weeklyEartquake: [] as IExternalSource[],
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
		},
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.stationController = props.stationController;
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

		// Get latest felt earthquake
		async function getSidebarInfo() {
			const latestEarthquake =
				(await this.state.controller.getLatestEarthquake()) as IExternalSource;
			const latestFeltEarthquake =
				(await this.state.controller.getLatestFeltEarthquake()) as IExternalSource;
			this.setState({
				sidebarProps: {
					latestFeltEarthquake,
					latestEarthquake,
				},
			});
		}

		getSidebarInfo.bind(this)();
	}
	render() {
		return (
			<main className="h-screen flex flex-col overflow-hidden">
				{/* NAVBAR */}
				<Navbar {...this.state.navbar} />

				{/* CONTENT */}
				<section className="flex h-full relative overflow-hidden">
					<Sidebar {...this.state.sidebarProps} />
					<div className="w-full h-full" id="eews-map"></div>
				</section>
			</main>
		);
	}
}

export default observer(MainView);
