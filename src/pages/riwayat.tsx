import React from "react";
import HistoryView from "@/views/HistoryView";
import { HistoryController } from "@/controllers/_index";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IEarthquakeDetection } from "@/entities/_index";

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const controller = new HistoryController();
		const start_date = new Date().getTime() - 1000 * 60 * 60 * 24 * 7; // 7 days ago
		const response = await controller.getHistoryEarthquakeDetection(start_date);

		if (
			response.data.length > 0
		) {
			return {
				props: {
					detections: [] as any,
				},
			};
		} else {
			return {
				props: {
					detections: response.data,
				},
			};
		}
	} catch (err) {
		return {
			props: {
				error: err.message,
				detections: [] as any,
			},
		};
	}
};

interface Props {
	error?: string;
	detections: IEarthquakeDetection[];
}

export default class Prediksi extends React.Component<Props> {
	state = {
		error: "",
		detections: [] as any,
	};

	constructor(props: Props) {
		super(props);
		this.state.error = props.error;
		this.state.detections = props.detections;
	}

	render() {
		const controller = new HistoryController();
		return (
			<>
				<Head>
					<title>TEWS | Prediksi</title>
				</Head>

				{this.state.error && (
					<div className="grid h-screen px-4 place-content-center">
						<h1 className="tracking-widest text-gray-500 uppercase">
							505 - Terjadi kesalahan pada server
						</h1>
					</div>
				)}
				<HistoryView
					controller={controller}
					historyDetections={this.state.detections}
				/>
			</>
		);
	}
}
