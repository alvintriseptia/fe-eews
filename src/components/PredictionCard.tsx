import { getIntensityColor } from "@/utils/map-style";
import React from "react";

export interface PredictionCardProps{
	magnitude: number;
	time: number;
	location: string;
	latitude: number;
	longitude: number;
	depth: number;
	onClick?: () => void;
};

class PredictionCard extends React.Component<PredictionCardProps> {
	render() {
		const intensityColor = getIntensityColor(this.props.magnitude);
		const date = new Date(this.props.time);
		const time = date.toLocaleDateString("id-ID") + " " + date.toLocaleTimeString();
		return (
			<div className="flex w-full border-b border-b-tews-mmi-II" onClick={this.props.onClick}>
				<div className={`${intensityColor} w-16 flex items-center justify-center text-2xl font-semibold`}>{this.props.magnitude?.toFixed(2) || ""}</div>

				<div className={`p-2 bg-tews-dark flex w-full justify-between text-white whitespace-pre-line hover:bg-tews-black-russian transition-all duration-200 ease-in-out hover:cursor-pointer`}>
					<div className="w-24 mr-10">
						<h6 className="text-xs mb-1 text-tews-boulder">Waktu</h6>
						<h5>{time}</h5>
					</div>

					<div className="max-w-[200px] mr-auto">
						<h6 className="text-xs mb-1 text-tews-boulder">Lokasi</h6>
						<h5 className="max-w-[200px]">{this.props.location}</h5>
					</div>

					<div className="ml-10">
						<h6 className="text-xs mb-1 text-tews-boulder">Koordinat</h6>
						<h5>{this.props.latitude?.toFixed(2) || ""}, {this.props.longitude?.toFixed(2) || 0}</h5>
					</div>

					<div className="ml-10">
						<h6 className="text-xs mb-1 text-tews-boulder">Kedalaman</h6>
						<h5>{this.props.depth?.toFixed(2) || "" } Km</h5>
					</div>
				</div>
			</div>
		);
	}
}

export default PredictionCard;
