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
							<h4 className="text-white text-sm">{this.props.date}</h4>
						</div>

						<div>
							<span className="text-gray-400 text-xs mb-1">Kedalaman</span>
							<h4 className="text-white text-sm">{this.props.depth}</h4>
						</div>
					</div>

					<div className="flex flex-col gap-y-3">
						<div>
							<span className="text-gray-400 text-xs mb-1">Waktu</span>
							<h4 className="text-white text-sm">{this.props.time}</h4>
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

export interface EarthquakeRealtimeProps {
	earthquake: IEarthquakePrediction;
}

class EarthquakeRealtimeCard extends React.Component<EarthquakeRealtimeProps> {
	state = {
		earthquake: {} as IEarthquakePrediction,
		borderColor: "",
		backgroundColor: "",
		intervalId: 0,
		countdown: 0,
		formattedDate: "",
	};

	constructor(props: EarthquakeRealtimeProps) {
		super(props);

		const { formattedDate, borderColor, backgroundColor } = this.setFormattedDateAndColors(props.earthquake);
		this.state = {
			earthquake: props.earthquake,
			countdown: props.earthquake.countdown as number,
			formattedDate: formattedDate,
			borderColor: borderColor,
			backgroundColor: backgroundColor,
			intervalId: 0,
		};
	}

	setFormattedDateAndColors(earthquake: IEarthquakePrediction) {
		let borderColor = "border-eews-mmi-II";
		let backgroundColor = "bg-eews-mmi-II";
		switch (earthquake.prediction.toLocaleLowerCase()) {
			case "warning":
				borderColor = "border-eews-swamp-green";
				backgroundColor= "bg-eews-swamp-green";
				break;
			case "earthquake":
				borderColor = "border-eews-mmi-V";
				backgroundColor= "bg-eews-mmi-V";
				break;
			case "cancelled":
				borderColor = "border-eews-mmi-X";
				backgroundColor= "bg-eews-mmi-X";
				break;
		}

		const date = new Date(earthquake.time_stamp);
		let newTime = "";
		if (date !== undefined) {
			const timezone = -(date.getTimezoneOffset() / 60);
			newTime =
				date.toLocaleDateString("id-ID") + " " + date.toLocaleTimeString();
			if (timezone === 7) {
				newTime += " WIB";
			} else if (timezone === 8) {
				newTime += " WITA";
			} else if (timezone === 9) {
				newTime += " WIT";
			}
		}

		return {
			formattedDate: newTime,
			borderColor: borderColor,
			backgroundColor: backgroundColor,
		}
	}

	componentDidMount() {
		this.countdownInterval();
	}

	componentDidUpdate(prevProps: EarthquakeRealtimeProps) {
		if (prevProps.earthquake !== this.props.earthquake) {
			const { formattedDate, borderColor, backgroundColor } = this.setFormattedDateAndColors(this.props.earthquake);
			this.setState({
				earthquake: this.props.earthquake,
				countdown: this.props.earthquake.countdown as number,
				formattedDate: formattedDate,
				borderColor: borderColor,
				backgroundColor: backgroundColor,
			});
		}

		else if (this.state.countdown <= 0) {
			this.handleCountdownFinish();
		}
	}

	countdownInterval() {
		const interval = setInterval(() => {
			this.setState((prevState: any) => ({
				countdown: prevState.countdown - 1,
			}));
		}, 1000);
		this.setState({ intervalId: interval });
	}

	handleCountdownFinish() {
		clearInterval(this.state.intervalId);
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	render() {
		return (
			<div
				className={`flex flex-col gap-y-1 border-4 ${this.state.borderColor}`}
			>
				<h2
					className={`${this.state.backgroundColor} w-full font-semibold text-white`}
				>
					{this.state.earthquake.title}
				</h2>
				<div className="px-2 pb-2 flex flex-col gap-y-2 text-xs">
					<p className="text-white mb-2 max-w-[400px]">
						{this.state.earthquake.description}
					</p>

					<div className="flex justify-between items-center gap-x-3">
						<span className="text-eews-silver">Tanggal</span>
						<h4 className="text-white font-semibold">
							{this.state.formattedDate}
						</h4>
					</div>

					{(this.state.earthquake.prediction.toLocaleLowerCase() ===
						"warning" ||
						this.state.earthquake.prediction.toLocaleLowerCase() ===
							"earthquake") && (
						<div className="flex justify-between items-center gap-x-3">
							<span className="text-eews-silver">Magnitude</span>
							<h4 className="text-white font-semibold">
								M {this.state.earthquake.mag}
							</h4>
						</div>
					)}

					{(this.state.earthquake.prediction.toLocaleLowerCase() ===
						"warning" ||
						this.state.earthquake.prediction.toLocaleLowerCase() ===
							"earthquake") && (
						<div className="flex justify-between items-center gap-x-3">
							<span className="text-eews-silver">Kedalaman</span>
							<h4 className="text-white font-semibold">
								{this.state.earthquake.depth?.toFixed(2) || "-"} Km
							</h4>
						</div>
					)}

					{(this.state.earthquake.prediction.toLocaleLowerCase() ===
						"warning" ||
						this.state.earthquake.prediction.toLocaleLowerCase() ===
							"earthquake") && (
						<div className="flex justify-between items-center gap-x-3">
							<span className="text-eews-silver">Latitude</span>
							<h4 className="text-white font-semibold">
								{this.state.earthquake.lat?.toFixed(2) || "-"}
							</h4>
						</div>
					)}

					{(this.state.earthquake.prediction.toLocaleLowerCase() ===
						"warning" ||
						this.state.earthquake.prediction.toLocaleLowerCase() ===
							"earthquake") && (
						<div className="flex justify-between items-center gap-x-3">
							<span className="text-eews-silver">Longitude</span>
							<h4 className="text-white font-semibold">
								{this.state.earthquake.long?.toFixed(2) || "-"}
							</h4>
						</div>
					)}

					{this.state.earthquake.prediction.toLocaleLowerCase() === "warning" &&
						this.state.countdown > 0 && (
							<div className="flex justify-between items-center gap-x-3">
								<span className="text-eews-silver">Countdown</span>
								<h4 className="text-white font-semibold">
									{this.state.countdown} s
								</h4>
							</div>
						)}
				</div>
			</div>
		);
	}
}

export interface SidebarProps {
	latestFeltEarthquake: IExternalSource;
	latestEarthquake: IExternalSource;
	earthquakePrediction: EarthquakeRealtimeProps;
}

class Sidebar extends React.Component<SidebarProps> {
	state = {
		open: true,
		latestFeltEarthquake: {} as IExternalSource,
		latestEarthquake: {} as IExternalSource,
		earthquakePrediction: {} as EarthquakeRealtimeProps,
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

		if (this.props.earthquakePrediction?.earthquake !== prevProps.earthquakePrediction?.earthquake) {
			this.setState({ earthquakePrediction: this.props.earthquakePrediction });
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
						</div>

						<div className="mt-auto">
							{this.state.earthquakePrediction &&
								this.state.earthquakePrediction.earthquake.time_stamp && (
									<EarthquakeRealtimeCard
										{...this.state.earthquakePrediction}
									/>
								)}
						</div>
					</aside>
				</div>
			</>
		);
	}
}

export default Sidebar;
