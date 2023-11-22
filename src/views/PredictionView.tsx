import React from "react";
import { observer } from "mobx-react";
import { PredictionController } from "@/controllers/_index";
import { IEarthquakePrediction, IMap, ISeismogram } from "@/entities/_index";

interface Props {
	controller: PredictionController;
}

class PredictionView extends React.Component<Props> {
	state = {
		controller: {} as PredictionController,
        earthquakePrediction: {} as IEarthquakePrediction,
        map: {} as IMap,
        seismogram: {} as ISeismogram,
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
	}
    download(){}
	render() {
		return (
			<div className="text-7xl font-bold text-center p-10">
                <h1>PREDIKSI VIEW</h1>
			</div>
		);
	}
}

export default observer(PredictionView);
