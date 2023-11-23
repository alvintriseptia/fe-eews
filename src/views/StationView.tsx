import React from "react";
import { observer } from "mobx-react";
import { StationController } from "@/controllers/_index";
import { ISeismogram, IStation } from "@/entities/_index";

interface Props {
	controller: StationController;
}

class StationView extends React.Component<Props> {
	state = {
		controller: {} as StationController,
		station: {} as IStation,
        seismogram: [] as ISeismogram[],
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.station = props.controller.getStationByCode("JAGI");
	}
	componentDidMount(): void {
		const seismogramWorker = new Worker(new URL("../workers/testing.ts", import.meta.url));
		this.state.controller.setSeismogramWorker(seismogramWorker);

		seismogramWorker.onmessage = (event) => {
			const seismogram = event.data as ISeismogram;
			console.log(seismogram);

			this.setState({ seismogram: [...this.state.seismogram, seismogram] });
		};
	}

	render() {
		return (
			<div>
				<div className="text-7xl font-bold text-center p-10">
					<h1>STATION VIEW</h1>
				</div>
				<p>{this.state.station.code}</p>
				<p>{this.state.station.description}</p>
				<button onClick={() => this.state.controller.displaySeismogram()}>Start</button>
				<button onClick={() => this.state.controller.stopSeismogram()}>Stop</button>
				<p>{JSON.stringify(this.state.seismogram)}</p>
			</div>
		);
	}
}

export default observer(StationView);
