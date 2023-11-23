import React from "react";
import { observer } from "mobx-react";
import { MainController } from "@/controllers/_index";
import { IEarthquakePrediction, IExternalSource, IMap, INotification, ISeismogram, IStation } from "@/entities/_index";

interface Props {
	controller: MainController;
}

class MainView extends React.Component<Props> {
	state = {
		controller: {} as MainController,
		station: {} as IStation,
        earthquakePrediction: {} as IEarthquakePrediction,
        map: {} as IMap,
        notification: {} as INotification,
        seismogram: [] as ISeismogram[],
        last5MEartquake: {} as IExternalSource,
        lastFeltEarthquake: {} as IExternalSource,
        weeklyEartquake: [] as IExternalSource[],
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
	}

	render() {
		return (
			<div className="text-7xl font-bold text-center p-10">
                <h1>MAIN VIEW</h1>
			</div>
		);
	}
}

export default observer(MainView);
