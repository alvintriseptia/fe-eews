import React from "react";
import MainView from "@/views/MainView";
import MainController from "@/controllers/MainController";
import Head from "next/head";

export default class Main extends React.Component {
	render() {
		const controller = new MainController();
		return <>
			<Head>
				<title>InaEEWS</title>
			</Head>
			<MainView controller={controller}/>
		</>
	}
}
