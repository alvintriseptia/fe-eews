import { IEarthquakePrediction, IExternalSource } from "@/entities/_index";
import { getIntensityColor } from "@/utils/map-style";
import { Bars4Icon } from "@heroicons/react/24/outline";
import React from "react";

class EarthquakeInfo extends React.Component<IExternalSource> {
	constructor(props: IExternalSource) {
		super(props);
		this.state = {};
	}

	render() {
		const backgroundColor = getIntensityColor(parseFloat(this.props.magnitude));
		let time = "";
		let date = "";
		if(typeof this.props.date === 'number') {
			const dateObj = new Date(this.props.date);
			const offset = new Date().getTimezoneOffset() * 60 * 1000;
			dateObj.setTime(dateObj.getTime() - offset);
			const timezone = -(new Date().getTimezoneOffset() / 60);
			const timezoneText = timezone === 7 ? "WIB" : timezone === 8 ? "WITA" : "WIT";
			time = dateObj.toLocaleTimeString() + " " + timezoneText;
			
			//date dd/mm/yyyy	
			date = dateObj.toLocaleDateString("id-ID", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		}else{
			time = this.props.time.toString();
			date = this.props.date;
		}

		return (
			<div className="flex flex-col gap-y-4">
				<div>
					<div className="flex justify-between gap-x-3">
						<h2 className="text-white font-semibold text-xl whitespace-pre-line">
							{this.props.title}
						</h2>

						<div className="flex flex-col items-end mt-1">
							<span className="text-xs text-white">Magnitude</span>
							<div
								className={`flex p-0.5 justify-center items-center font-semibold ${backgroundColor}`}
							>
								{Number(this.props.magnitude).toFixed(1)}
							</div>
						</div>
					</div>

					<p className="text-gray-400 text-sm">{this.props.location}</p>
				</div>

				<div className="flex justify-between items-center gap-x-3 whitespace-nowrap">
					<div className="flex flex-col gap-y-3">
						<div>
							<span className="text-gray-400 text-xs mb-1">Tanggal</span>
							<h4 className="text-white text-sm">{date}</h4>
						</div>

						<div>
							<span className="text-gray-400 text-xs mb-1">Kedalaman</span>
							<h4 className="text-white text-sm">{this.props.depth}</h4>
						</div>
					</div>

					<div className="flex flex-col gap-y-3">
						<div>
							<span className="text-gray-400 text-xs mb-1">Waktu</span>
							<h4 className="text-white text-sm">{time}</h4>
						</div>

						<div>
							<span className="text-gray-400 text-xs mb-1">Latitude</span>
							<h4 className="text-white text-sm">{this.props.latitude}</h4>
						</div>
					</div>

					<div className="flex flex-col gap-y-3">
						<div>
							<span className="text-gray-400 text-xs mb-1">Stasiun</span>
							<h4 className="text-white text-sm">{this.props.station}</h4>
						</div>

						<div>
							<span className="text-gray-400 text-xs mb-1">Longitude</span>
							<h4 className="text-white text-sm">{this.props.longitude}</h4>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export interface SidebarProps {
	latestFeltEarthquake: IExternalSource;
	latestEarthquake: IExternalSource;
	latestPrediction: IEarthquakePrediction | null;
}

class Sidebar extends React.Component<SidebarProps> {
	state = {
		open: true,
		latestFeltEarthquake: {} as IExternalSource,
		latestEarthquake: {} as IExternalSource,
		latestPrediction: {} as IEarthquakePrediction,
	};

	constructor(props: SidebarProps) {
		super(props);
		this.toggleSidebar = this.toggleSidebar.bind(this);
		this.state = { ...props, open: true };
	}

	toggleSidebar() {
		this.setState((prevState: any) => ({
			open: !prevState.open,
		}));
	}

	componentDidUpdate(prevProps: SidebarProps) {
		if (this.props.latestFeltEarthquake !== prevProps.latestFeltEarthquake) {
			this.setState({ latestFeltEarthquake: this.props.latestFeltEarthquake });
		}

		if (this.props.latestEarthquake !== prevProps.latestEarthquake) {
			this.setState({ latestEarthquake: this.props.latestEarthquake });
		}

		if (this.props.latestPrediction !== prevProps.latestPrediction) {
			if(this.props.latestPrediction.prediction !== "warning") return;
			this.setState({ latestPrediction: this.props.latestPrediction });
		}
	}

	render() {
		return (
			<>
				<button
					className={`px-3 py-2 text-base rounded-lg items-center bg-eews-dark text-white font-semibold hover:bg-eews-boulder transition-all fixed top top-3 left-2`}
					onClick={this.toggleSidebar}
				>
					<Bars4Icon className="w-6 h-6" />
				</button>

				<div
					className={`${
						this.state.open
							? " w-[450px] translate-x-0"
							: "w-0 -translate-x-[450px]"
					} transition-all`}
				>
					<aside className="flex flex-col bg-transparent overflow-y-auto h-full">
						<div className="p-4 flex flex-col">
							{this.state.latestFeltEarthquake?.title && (
								<>
									<EarthquakeInfo {...this.state.latestFeltEarthquake} />
									<div className="w-full h-0.5 bg-purple-950 my-4" />
								</>
							)}

							{this.state.latestEarthquake?.title && (
								<EarthquakeInfo {...this.state.latestEarthquake} />
							)}

							{this.state.latestPrediction?.time_stamp && (
								<>
									<div className="w-full h-0.5 bg-purple-950 my-4" />
									<EarthquakeInfo 
										id={'latest-prediction'}
										date={this.state.latestPrediction.time_stamp}
										title={'Deteksi Terakhir'}
										depth={this.state.latestPrediction.depth.toFixed(2)}
										latitude={this.state.latestPrediction.lat.toFixed(2)}
										longitude={this.state.latestPrediction.long.toFixed(2)}
										location={this.state.latestPrediction.location}
										magnitude={this.state.latestPrediction.mag.toFixed(1)}
										time={this.state.latestPrediction.time_stamp}
										station={this.state.latestPrediction.station || "inatews"}
									/>
								</>
							)}
						</div>
					</aside>
				</div>
			</>
		);
	}
}

export default Sidebar;
