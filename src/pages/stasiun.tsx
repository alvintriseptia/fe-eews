import React from "react";
import StationView from "@/views/StationView";
import Head from "next/head";

export default class Stasiun extends React.Component {
	render() {
		if(typeof window === "undefined") {
			return null;
		}
		
		return (
			<>
				<Head>
					<title>TEWS</title>
				</Head>
				<StationView />
			</>
		);
	}
}
