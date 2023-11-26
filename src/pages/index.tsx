import React from "react";
import MainView from "@/views/MainView";
import { MainController, StationController } from "@/controllers/_index";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IExternalSource } from "@/entities/IExternalSource";
import { NavbarProps } from "@/components/Navbar";
import { IEarthquakePrediction } from "@/entities/IEarthquakePrediction";
import { EarthquakeRealtimeProps } from "@/components/Sidebar";

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

		if(!latestEarthquake){
			delete props.sidebarProps.latestEarthquake;
		}
		if(!latestFeltEarthquake){
			delete props.sidebarProps.latestFeltEarthquake;
		}
		if(!weeklyEarthquake){
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

export default class Main extends React.Component<Props> {
	constructor(props: Props) {
		super(props);
	}
	render() {
		const controller = new MainController();
		const stationController = new StationController();
		return (
			<>
				<Head>
					<title>InaEEWS</title>
				</Head>
				<MainView
					controller={controller}
					stationController={stationController}
					weeklyEarthquake={this.props.weeklyEarthquake}
					navbar={this.props.navbar}
					sidebarProps={this.props.sidebarProps}
				/>
			</>
		);
	}
}
