"use client";
import React from "react";
import STATIONS_DATA from "@/assets/data/stations.json";
import { Layout } from "plotly.js";
import Socket from "@/lib/Socket";
import RenderIfVisible from "react-render-if-visible";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const MAX_TIME = 1 * 60 * 1000; // 10 minutes in milliseconds
const SAMPLING_RATE = 20;
const ESTIMATED_ITEM_HEIGHT = 200;
const stations = {};
const configLayout = {
	datarevision: 0,
	paper_bgcolor: "#0D121C",
	plot_bgcolor: "transparent",
	height: 100,
	margin: {
		// l: 0,
		r: 0,
		b: 0,
		t: 0,
		pad: 0,
	},
	xaxis: {
		type: "date",
		color: "#fff",
		showspikes: false,
		autorange: true,
	},
	yaxis: {
		type: "linear",
		color: "#fff",
	},
	dragmode: false,
} as Partial<Layout>;
let index = 0;
for (const station of STATIONS_DATA) {
	stations[station.code] = {
		x: [],
		y: [],
		mode: "lines",
		line: {
			color: "#00b7ff",
		},
		showlegend: false,
	} as Plotly.Data;
	index++;
}

function TracerViewPlotly() {
	function rand() {
		return Math.random() * 100;
	}
	const [layout, setLayout] = React.useState(configLayout);

	React.useEffect(() => {
		setInterval(() => {
			for (const station of STATIONS_DATA) {
				stations[station.code].x.push(new Date().getTime());
				stations[station.code].y.push(rand());
			}

			const newLayout = {
				...layout,
				datarevision: (layout.datarevision as number) + 1,
			};
			setLayout(newLayout);
		}, 1000);
	}, []);

	return (
		<section className="overflow-hidden w-screen h-screen relative">
			<div
				className="overflow-y-auto overflow-x-hidden h-full pr-10 pt-10"
				style={{ paddingBottom: "100px" }}
			>
				{Object.keys(stations).map((key, index) => {
					return (
						// <RenderIfVisible defaultHeight={ESTIMATED_ITEM_HEIGHT}>
						<Plot
							key={index}
							divId={`trace-${key}`}
							data={[stations[key]]}
							layout={layout}
							style={{ width: "100%" }}
							config={{ displayModeBar: false }}
							revision={layout.datarevision as number}
						/>
						// </RenderIfVisible>
					);
				})}
			</div>

			<div className="absolute z-50 bottom-0 left-0 right-[58px]"></div>
		</section>
	);
}

export default TracerViewPlotly;
