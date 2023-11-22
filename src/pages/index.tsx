import React from "react";
import StationView from "@/views/StationView";
import StationController from "@/controllers/StationController";

export default class Home extends React.Component {
	render() {
		const controller = new StationController();
		return <StationView controller={controller} />;
	}
}
