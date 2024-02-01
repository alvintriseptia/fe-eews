import React from "react";
import MainView from "@/views/MainView";
import { MainController, HistoryController, StationController } from "@/controllers/_index";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { NavbarProps } from "@/components/Navbar";
import SeismogramContext from "@/stores/SeismogramContext";
import { IEarthquakeDetection, IEarthquakeHistory } from "@/entities/_index";

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const controller = new MainController();
		const detectionController = new HistoryController();
		const latestEarthquake =
			(await controller.getLatestEarthquake()) as IEarthquakeHistory;
		const latestFeltEarthquake =
			(await controller.getLatestFeltEarthquake()) as IEarthquakeHistory;
		const weeklyEarthquake =
			(await controller.getEarthquakeWeekly()) as IEarthquakeHistory[];
		const latestDetection =
			(await detectionController.getLatestEarthquakeDetection()) as IEarthquakeDetection;
		
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
				latestDetection
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
					latestFeltEarthquake: {} as IEarthquakeHistory,
					latestEarthquake: {} as IEarthquakeHistory,
					latestDetection: {} as IEarthquakeDetection,
				},
				weeklyEarthquake: [] as IEarthquakeHistory[],
			},
		};
	}
};

interface Props {
	weeklyEarthquake: IEarthquakeHistory[];
	navbar: NavbarProps;
	sidebarProps: {
		latestFeltEarthquake: IEarthquakeHistory;
		latestEarthquake: IEarthquakeHistory;
		latestDetection: IEarthquakeDetection;
	};
}

export default class Main extends React.Component<Props> {
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
		const controller = new MainController();
		return (
			<>
				<Head>
					<title>TEWS</title>
				</Head>
				<SeismogramContext.Provider value={this.state.seismogramWorker}>
					<MainView
						mode="realtime"
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
