import React from "react";
import StationView from "@/views/StationView";
import StationController from "@/controllers/StationController";
import Head from "next/head";

export default class Stasiun extends React.Component {
	render() {
		const controller = new StationController();
		return <>
			<Head>
				<title>InaEEWS</title>
			</Head>
			<StationView controller={controller}/>
		</>
	}
}
