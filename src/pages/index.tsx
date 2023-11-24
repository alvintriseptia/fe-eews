import React from "react";
import MainView from "@/views/MainView";
import { MainController, StationController } from "@/controllers/_index";
import Head from "next/head";

export default class Main extends React.Component {
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
				/>
			</>
		);
	}
}
