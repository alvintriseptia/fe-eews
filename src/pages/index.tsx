import React from "react";
import MainView from "@/views/MainView";
import {
	MainController,
	StationController,
} from "@/controllers/_index";
import Head from "next/head";

export default class Main extends React.Component{
	render() {
		if(typeof window === "undefined") return (<></>);
		const controller = new MainController();
		const stationController = StationController.getInstance();
		return (
			<>
				<Head>
					<title>TEWS</title>
				</Head>
				<MainView
					mode="realtime"
					controller={controller}
					stationController={stationController}
				/>
			</>
		);
	}
}
