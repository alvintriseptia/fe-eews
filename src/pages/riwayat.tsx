import React from "react";
import HistoryView from "@/views/HistoryView";
import {DetectionController} from "@/controllers/_index";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IEarthquakeDetection } from "@/entities/_index";

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const controller = new DetectionController();

		const response = await controller.getHistoryEarthquakeDetection();

		
		const props = {
			detections: response.data,
		};

		return {
			props,
		};
	} catch (err) {
		return {
			props: {
				controller: {} as DetectionController,
				detections: [] as any,
			},
		};
	}
};

interface Props {
	detections: IEarthquakeDetection[];
}

export default class Prediksi extends React.Component<Props> {
	state = {
		detections: [] as any,
	};

	constructor(props: Props) {
		super(props);
		this.state.detections = props.detections;
	}

	render() {
		const controller = new DetectionController();
		return (
			<>
				<Head>
					<title>TEWS | Prediksi</title>
				</Head>

				{this.state.detections.length === 0 && (
					<div className="grid h-screen px-4 place-content-center">
						<h1 className="tracking-widest text-gray-500 uppercase">
							505 - Terjadi kesalahan pada server
						</h1>
					</div>
				)}
				{this.state.detections.length > 0 && (
					<HistoryView
						controller={controller}
						historyDetections={this.state.detections}
					/>
				)}
			</>
		);
	}
}
