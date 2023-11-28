import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import React, { Component } from "react";
import { ISeismogram } from "@/entities/_index";
import DynamicLineChart from "./DynamicLineChart";

interface SeismogramProps {
	seismogramStations: string[];
}

export default class Seismogram extends Component<SeismogramProps> {
	state = {
		open: false,
		seismogramStations: [] as string[],
	};

	constructor(props: any) {
		super(props);
		this.state.seismogramStations = props.seismogramStations;
	}

	toggleOpen = () => {
		this.setState({ open: !this.state.open });
	};
	render() {
		return (
			<>
				<section className="absolute right-4 top-12 z-10">
					<button
						className="bg-white hover:bg-gray-300 transition-all duration-200 ease-in-out rounded-md p-1"
						onClick={this.toggleOpen}
					>
						<ChevronDoubleRightIcon
							className={`w-6 h-6 transition-all transform rotate-180`}
						/>
					</button>
				</section>
				<section
					className={`absolute bg-eews-cinder right-0 w-[550px] h-screen z-50 transition-all duration-200 ease-in-ou
					${this.state.open ? "translate-x-0" : "translate-x-full"}
					`}
				>
					<button
						className="bg-white hover:bg-gray-300 relative z-20 transition-all duration-200 ease-in-out rounded-md p-1 mt-2"
						onClick={this.toggleOpen}
					>
						<ChevronDoubleRightIcon className={`w-6 h-6 transition-all`} />
					</button>
					<aside  className="flex flex-col h-full overflow-y-auto">
						{this.state.seismogramStations.map((station, index) => {
							return <DynamicLineChart station={station} key={index} />;
						})}
					</aside>
				</section>
			</>
		);
	}
}
