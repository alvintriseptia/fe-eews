import dynamic from "next/dynamic";
import { Layout } from "plotly.js";
import React, { Component } from "react";

const Plot = dynamic(
	() => import("react-plotly.js").then((mod) => mod.default),
	{
		ssr: false,
	}
);

type WaveChannel = {
	x: number[];
	y: number[];
	name: string;
};

export interface PredictionRecapContentProps {
	magnitude: number;
	depth: number;
	latitude: number;
	longitude: number;
	location: string;
	timestamp: string;
	station: string;
	waves: WaveChannel;
}

class PredictionRecapContent extends Component<PredictionRecapContentProps> {
	render() {
		const layout = {
			datarevision: 0,
			xaxis: {
				type: "date",
				color: "#fff",
				range: [Date.now() - 30000, Date.now()],
			},
			yaxis: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
			},
			yaxis2: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
			},
			yaxis3: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
			},
			yaxis4: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
				overlaying: "y",
			},
			yaxis5: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
				overlaying: "y2",
			},
			yaxis6: {
				type: "linear",
				color: "#fff",
				range: [-500, 3000],
				fixedrange: true,
				overlaying: "y3",
			},
			height: 500,
			width: 950,
			paper_bgcolor: "#0D121C",
			plot_bgcolor: "transparent",
			grid: {
				rows: 3,
				columns: 1,
				subplots: ["xy", "xy2", "xy3"],
				roworder: "top to bottom",
				xgap: 0.05,
				ygap: 0.05,
				xside: "bottom plot",
				yside: "left plot",
			},
		} as Partial<Layout>;

		return (
			<section className="flex flex-col p-4 border-b">
				<div className="flex justify-between mb-4 relative z-10">
					<div>
						<h6 className="text-eews-boulder text-xs">Lokasi</h6>
						<p className="text-white max-width-[200px]">{this.props.location}</p>
					</div>

					<div>
						<h6 className="text-eews-boulder text-xs">Waktu</h6>
						<p className="text-white">{this.props.timestamp}</p>
					</div>

					<div>
						<h6 className="text-eews-boulder text-xs">Magnitude</h6>
						<p className="text-white">{this.props.magnitude}</p>
					</div>

					<div>
						<h6 className="text-eews-boulder text-xs">Kedalaman</h6>
						<p className="text-white">{this.props.depth}Km</p>
					</div>

					<div>
						<h6 className="text-eews-boulder text-xs">Latitude</h6>
						<p className="text-white">{this.props.latitude}</p>
					</div>

					<div>
						<h6 className="text-eews-boulder text-xs">Longitude</h6>
						<p className="text-white">{this.props.longitude}</p>
					</div>
					<div>
						<h6 className="text-eews-boulder text-xs">Stasiun</h6>
						<p className="text-white">{this.props.station}</p>
					</div>
				</div>

				<div className="w-full relative -top-10 right-0">
					<Plot
						data={[this.props.waves]}
						layout={layout}
						style={{ width: "100%", height: "100%" }}
					/>
				</div>
			</section>
		);
	}
}

export default PredictionRecapContent;
