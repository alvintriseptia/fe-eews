import React from "react";
import HistoryView from "@/views/HistoryView";
import { HistoryController } from "@/controllers/_index";
import Head from "next/head";

export default class Riwayat extends React.Component {
	render() {
		const controller = new HistoryController();
		return (
			<>
				<Head>
					<title>TEWS | Riwayat</title>
				</Head>
				<HistoryView
					controller={controller}
				/>
			</>
		);
	}
}
