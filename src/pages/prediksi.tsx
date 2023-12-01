import React from "react";
import PredictionView from "@/views/PredictionView";
import {PredictionController} from "@/controllers/_index";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IEarthquakePrediction } from "@/entities/_index";

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const controller = new PredictionController();

		const response = await controller.getHistoryEarthquakePrediction();

		
		const props = {
			predictions: response.data,
		};

		return {
			props,
		};
	} catch (err) {
		return {
			props: {
				controller: {} as PredictionController,
				predictions: [] as any,
			},
		};
	}
};

interface Props {
	predictions: IEarthquakePrediction[];
}

export default class Prediksi extends React.Component<Props> {
	state = {
		predictions: [] as any,
	};

	constructor(props: Props) {
		super(props);
		this.state.predictions = props.predictions;
	}

	render() {
		const controller = new PredictionController();
		return (
			<>
				<Head>
					<title>InaTEWS | Prediksi</title>
				</Head>

				{this.state.predictions.length === 0 && (
					<div className="grid h-screen px-4 place-content-center">
						<h1 className="tracking-widest text-gray-500 uppercase">
							505 - Terjadi kesalahan pada server
						</h1>
					</div>
				)}
				{this.state.predictions.length > 0 && (
					<PredictionView
						controller={controller}
						historyPedictions={this.state.predictions}
					/>
				)}
			</>
		);
	}
}
