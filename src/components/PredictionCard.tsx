import { getIntensityColor } from "@/utils/map-style";
import React from "react";

export interface PredictionCardProps{
	magnitude: number;
	time: string;
	location: string;
	latitude: number;
	longitude: number;
	depth: number;
};

class PredictionCard extends React.Component<PredictionCardProps> {
	render() {
		const intensityColor = getIntensityColor(this.props.magnitude);

		return (
			<div className="flex w-full border-b border-b-eews-mmi-II">
				<div className={`${intensityColor} w-16 flex items-center justify-center text-2xl font-semibold`}>{this.props.magnitude}</div>

				<div className={`p-2 bg-eews-dark flex w-full justify-between text-white whitespace-pre-line hover:bg-eews-black-russian transition-all duration-200 ease-in-out hover:cursor-pointer`}>
					<div className="w-24 mr-10">
						<h6 className="text-xs mb-1 text-eews-boulder">Waktu</h6>
						<h5>{this.props.time}</h5>
					</div>

					<div className="max-w-[200px] mr-auto">
						<h6 className="text-xs mb-1 text-eews-boulder">Lokasi</h6>
						<h5 className="max-w-[200px]">{this.props.location}</h5>
					</div>

					<div className="ml-10">
						<h6 className="text-xs mb-1 text-eews-boulder">Koordinat</h6>
						<h5>{this.props.latitude}, {this.props.longitude}</h5>
					</div>

					<div className="ml-10">
						<h6 className="text-xs mb-1 text-eews-boulder">Kedalaman</h6>
						<h5>{this.props.depth}</h5>
					</div>
				</div>
			</div>
		);
	}
}

export default PredictionCard;
