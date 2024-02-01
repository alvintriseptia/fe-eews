import React from "react";
import StationView from "@/views/StationView";
import StationController from "@/controllers/StationController";
import Head from "next/head";
import { NavbarProps } from "@/components/Navbar";
import SeismogramContext from "@/stores/SeismogramContext";
import * as indexedDB from "@/lib/indexed-db";

interface Props {
	navbar: NavbarProps;
}

export default class Stasiun extends React.Component {
	state = {
		seismogramWorker: null as Worker | null,
		stationController: {} as StationController,
	};

	constructor(props: Props) {
		super(props);
		this.state = {
			seismogramWorker: null,
			stationController: {} as StationController,
		};
	}
	componentDidMount() {
		const seismogramWorker = new Worker(
			new URL("../workers/seismogram.ts", import.meta.url)
		);
		indexedDB.createIndexedDB().then(() => {
			this.setState({
				seismogramWorker,
				stationController: new StationController(seismogramWorker),
			});
		});
	}

	componentWillUnmount(): void {
		if (this.state.seismogramWorker !== null) {
			this.state.seismogramWorker.terminate();
		}
	}

	render() {
		if (!this.state.seismogramWorker) return <></>;
		return (
			<>
				<Head>
					<title>TEWS</title>
				</Head>
				<SeismogramContext.Provider value={this.state.seismogramWorker}>
					<StationView
						controller={this.state.stationController}
					/>
				</SeismogramContext.Provider>
			</>
		);
	}
}
