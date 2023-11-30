import React from "react";
import { observer } from "mobx-react";
import { StationController } from "@/controllers/_index";
import { ISeismogram, IStation } from "@/entities/_index";
import SeismogramContext from "@/stores/SeismogramContext";
import EarthquakePredictionContext from "@/stores/EarthquakePredictionContext";
import MainContext from "@/stores/MainContext";
import { DynamicLineChart } from "@/components/_index";

interface Props {
	controller: StationController;
    seismogramStations: string[];
}

class StationView extends React.Component<Props> {
	state = {
		controller: {} as StationController,
		station: {} as IStation,
		seismogramStations: [] as string[],
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		this.state.station = props.controller.getStationByCode("JAGI");
		this.state.seismogramStations = props.seismogramStations;
	}
	componentDidMount(): void {}

	componentWillUnmount(): void {}

	render() {
		return (
			<SeismogramContext.Consumer>
				{(seismogramWorker) => (
					<EarthquakePredictionContext.Consumer>
						{(earthquakePrediction) => (
							<MainContext.Provider
								value={{ seismogramWorker, earthquakePrediction }}
							>
								{this.state.seismogramStations.map((station, index) => {
									return <DynamicLineChart station={station} key={index} />;
								})}
							</MainContext.Provider>
						)}
					</EarthquakePredictionContext.Consumer>
				)}
			</SeismogramContext.Consumer>
		);
	}
}

export default observer(StationView);
