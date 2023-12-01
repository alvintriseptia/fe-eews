// import React from "react";
// import StationView from "@/views/StationView";
// import StationController from "@/controllers/StationController";
// import Head from "next/head";

// export default class Stasiun extends React.Component {
// 	state = {
// 		seismogramWorker: null as Worker | null,
// 		stationController: {} as StationController,
// 	};

// 	constructor(props: any) {
// 		super(props);
// 		this.state = {
// 			seismogramWorker: null,
// 			stationController: {} as StationController,
// 		};
// 	}
// 	render() {
// 		if(!this.state.seismogramWorker) return (<></>)
// 		return <>
// 			<Head>
// 				<title>InaTEWS</title>
// 			</Head>
// 			<StationView controller={controller}/>
// 		</>
// 	}
// }
