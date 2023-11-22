import React from "react";
import PredictionView from "@/views/PredictionView";
import PredictionController from "@/controllers/PredictionController";
import Head from "next/head";

export default class Prediksi extends React.Component {
	render() {
		const controller = new PredictionController();
		return <>
			<Head>
				<title>InaEEWS</title>
			</Head>
			<PredictionView controller={controller}/>
		</>
	}
}
