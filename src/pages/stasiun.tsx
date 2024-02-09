import React from "react";
import StationView from "@/views/StationView";
import Head from "next/head";
import { NavbarProps } from "@/components/Navbar";
import * as indexedDB from "@/lib/indexed-db";

interface Props {
	navbar: NavbarProps;
}

export default class Stasiun extends React.Component {
	state = {
		isLoading: true,
	};
	componentDidMount() {
		indexedDB.createIndexedDB().then(() => {
			this.setState({ isLoading: false });
		});
	}
	render() {
		if (this.state.isLoading) return <></>;
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
