import React from "react";
import { getIntensityColor } from "../utils/map-style";
import { MapPinIcon } from "@heroicons/react/24/outline";
import {
	ChevronDoubleRightIcon,
	ListBulletIcon,
} from "@heroicons/react/24/outline";
import { IExternalSource } from "@/entities/IExternalSource";

class HistoryCard extends React.Component<IExternalSource> {
	render() {
		const backgroundColor = getIntensityColor(Number(this.props.magnitude));
		const time = new Date(this.props.time);
		const timezone = -(time.getTimezoneOffset() / 60);
		time.setHours(time.getHours() + timezone);
		let timeString =
			time.toLocaleDateString("id-ID") + " " + time.toLocaleTimeString();
		// Add timezone WIB, WITA, or WIT
		if (timezone === 7) {
			timeString += " WIB";
		} else if (timezone === 8) {
			timeString += " WITA";
		} else if (timezone === 9) {
			timeString += " WIT";
		}

		return (
			<div
				className={`flex p-1 ${backgroundColor} gap-x-2 items-center border-y border-eews-black-russian`}
			>
				<h4
					className={`font-semibold text-white ${
						this.props.id === 1 ? "text-4xl" : "text-xl"
					}`}
				>
					{Number(this.props.magnitude).toFixed(1)}
				</h4>
				<div
					className={`text-gray-300 ${
						this.props.id === 1 ? "text-sm" : "text-xs"
					} flex-1`}
				>
					<h5 className="text-base">{this.props.location}</h5>
					<p className="mb-1">{timeString}</p>

					<div className="flex justify-between text-gray-400">
						<div className="flex gap-x-1">
							<MapPinIcon className="w-4 h-4" />
							<p>
								{Number(this.props.latitude).toFixed(3)},
								{Number(this.props.longitude).toFixed(3)}
							</p>
						</div>

						<p>{Number(this.props.depth).toFixed(0)} Km</p>
					</div>
				</div>
			</div>
		);
	}
}

interface EarthquakeHistorySidebarProps {
	weeklyEarthquake: IExternalSource[];
}

class EarthquakeHistorySidebar extends React.Component<EarthquakeHistorySidebarProps> {
	state = { open: false, weeklyEarthquake: [] as IExternalSource[] };
	constructor(props: EarthquakeHistorySidebarProps) {
		super(props);

		this.setOpen = this.setOpen.bind(this);
	}

	componentDidUpdate(prevProps: Readonly<EarthquakeHistorySidebarProps>): void {
		if (prevProps.weeklyEarthquake !== this.props.weeklyEarthquake) {
			this.setState({
				open: false,
				weeklyEarthquake: this.props.weeklyEarthquake,
			});
		}
	}

	setOpen = (open: boolean) => {
		this.setState({ open });
	};

	render() {
		return (
			<>
				<section className="absolute right-4 top-2 z-10">
					<button
						className="bg-white hover:bg-gray-300 transition-all duration-200 ease-in-out rounded-md p-1"
						onClick={() => this.setOpen(true)}
					>
						<ListBulletIcon className="w-6 h-6" />
					</button>
				</section>
				<section
					className={`absolute right-0 bottom-0 top-0 w-80 z-40 flex items-start transition-all duration-200 ease-in-out ${
						this.state.open ? "translate-x-0" : "translate-x-full"
					}`}
				>
					<button
						className="bg-white hover:bg-gray-300 transition-all duration-200 ease-in-out rounded-md p-1 mt-2"
						onClick={() => this.setOpen(false)}
					>
						<ChevronDoubleRightIcon className="w-6 h-6" />
					</button>
					<aside className="flex flex-col bg-eews-cinder h-full overflow-y-auto">
						{this.state.weeklyEarthquake.length > 0 ? (
							this.state.weeklyEarthquake.map((feature, index) => {
								feature.id = index + 1;
								return <HistoryCard key={index} {...feature} />;
							})
						) : (
							<div className="flex flex-col items-center justify-center h-full">
								<h1 className="text-2xl font-semibold text-white">
									Tidak ada gempa bumi
								</h1>
								<p className="text-white text-center">
									Tidak ada gempa bumi yang terjadi dalam 7 hari terakhir
								</p>
							</div>
						)}
					</aside>
				</section>
			</>
		);
	}
}

export default EarthquakeHistorySidebar;
