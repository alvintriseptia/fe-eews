import React from "react";
import MainView from "@/views/MainView";
import { MainController, SimulationController, StationController } from "@/controllers/_index";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IExternalSource } from "@/entities/IExternalSource";
import { NavbarProps } from "@/components/Navbar";
import { EarthquakeRealtimeProps } from "@/components/Sidebar";
import SeismogramContext from "@/stores/SeismogramContext";

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const controller = new MainController();
		const latestEarthquake =
			(await controller.getLatestEarthquake()) as IExternalSource;
		const latestFeltEarthquake =
			(await controller.getLatestFeltEarthquake()) as IExternalSource;
		const weeklyEarthquake =
			(await controller.getEarthquakeWeekly()) as IExternalSource[];

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

		if (newNavbar.minimumMagnitude === 100) newNavbar.minimumMagnitude = 0;

		const props = {
			navbar: newNavbar,
			sidebarProps: {
				latestFeltEarthquake,
				latestEarthquake,
			},
			weeklyEarthquake,
		};

		if (!latestEarthquake) {
			delete props.sidebarProps.latestEarthquake;
		}
		if (!latestFeltEarthquake) {
			delete props.sidebarProps.latestFeltEarthquake;
		}
		if (!weeklyEarthquake) {
			delete props.weeklyEarthquake;
		}

		return {
			props,
		};
	} catch (e) {
		console.error(e);
		return {
			props: {
				navbar: {
					totalEarthquakes: 0,
					maximumMagnitude: 0,
					minimumMagnitude: 0,
				},
				sidebarProps: {
					latestFeltEarthquake: {} as IExternalSource,
					latestEarthquake: {} as IExternalSource,
				},
				weeklyEarthquake: [] as IExternalSource[],
			},
		};
	}
};

interface Props {
	weeklyEarthquake: IExternalSource[];
	navbar: NavbarProps;
	sidebarProps: {
		latestFeltEarthquake: IExternalSource;
		latestEarthquake: IExternalSource;
		earthquakePrediction: EarthquakeRealtimeProps;
	};
}

export default class Simulation extends React.Component<Props> {
	state = {
		seismogramWorker: null as Worker | null,
		stationController: {} as StationController,
	};

	constructor(props: Props) {
		super(props);
		this.state = {
			seismogramWorker: null,
			stationController: {} as StationController,
		};
	}

	componentDidMount() {
		const seismogramWorker = new Worker(
			new URL("../workers/seismogram.ts", import.meta.url)
		);
		this.setState({ seismogramWorker, stationController: new StationController(seismogramWorker) });
	}

	componentWillUnmount(): void {
		if (this.state.seismogramWorker !== null) {
			this.state.seismogramWorker.terminate();
		}
	}

	render() {
		if(!this.state.seismogramWorker) return (<></>)
		const controller = new SimulationController();
		return (
			<>
				<Head>
					<title>InaTEWS</title>
				</Head>
				<SeismogramContext.Provider value={this.state.seismogramWorker}>
					<MainView
                        mode="simulation"
						controller={controller}
						stationController={this.state.stationController}
						weeklyEarthquake={this.props.weeklyEarthquake}
						navbar={this.props.navbar}
						sidebarProps={this.props.sidebarProps}
					/>
				</SeismogramContext.Provider>
			</>
		);
	}
}
