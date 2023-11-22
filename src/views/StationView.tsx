import React from "react";
import { observer } from "mobx-react";
import { StationController } from "@/controllers/_index";
import { IStation } from "@/entities/_index";

interface Props {
	controller: StationController;
}

class StationView extends React.Component<Props> {
	state = {
		controller: {} as StationController,
		station: {} as IStation,
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.station = props.controller.getStationByCode("JAGI");
	}

	render() {
		return (
			<div>
				<div className="text-7xl font-bold text-center p-10">
					<h1>STATION VIEW</h1>
				</div>
				<p>{this.state.station.code}</p>
				<p>{this.state.station.description}</p>
			</div>
		);
	}
}

export default observer(StationView);
