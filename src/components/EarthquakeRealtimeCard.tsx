import { IEarthquakePrediction } from "@/entities/IEarthquakePrediction";
import React from "react";


export interface EarthquakeRealtimeProps {
	earthquake: IEarthquakePrediction;
}

export default class EarthquakeRealtimeCard extends React.Component<EarthquakeRealtimeProps> {
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
			const offset = new Date().getTimezoneOffset() * 60 * 1000;
			const timezone = -(date.getTimezoneOffset() / 60);
			date.setTime(date.getTime() - offset);
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
				className={`flex flex-col gap-y-1 border-4 bg-eews-cinder max-w-[350px] ${this.state.borderColor}`}
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