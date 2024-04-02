"use client";
import React from "react";
import STATIONS_DATA from "@/assets/data/stations.json";
import { Layout } from "plotly.js";
import RenderIfVisible from "react-render-if-visible";
import { Line } from "react-chartjs-2";
import ChartJS from "chart.js/auto";
import { TimeScale } from "chart.js";
import "chartjs-adapter-luxon";
ChartJS.register(TimeScale);
const ESTIMATED_ITEM_HEIGHT = 200;
const stations = {};
for (const station of STATIONS_DATA) {
	stations[station.code] = {
		datasets: [
			{
				data: [],
				label: station.code,
				backgroundColor: "#00b7ff",
				borderColor: "#00b7ff",
				showLegend: false,
				yAxisID: "y",
				order: 1,
			},
			{
				data: [],
				label: "P-Wave Arrival",
				backgroundColor: "#ff0000",
				borderColor: "#ff0000",
				yAxisID: "y2",
				order: 0,
			},
		],
	} as Plotly.Data;
}

const options = {
	scales: {
		x: {
			type: "time",
		},
		y2: {
			position: "right",
			display: false,
		},
		y: {
			display: true,
			grid: {
				display: false,
			},
		},
	},
	responsive: true,
	plugins: {
		legend: {
			position: "left" as const,
			labels: {
				filter: function (label) {
					if (label.text === "P-Wave Arrival") return false;
					else return true;
				},
			},
		},
		title: {
			display: false,
		},
	},
	maintainAspectRatio: false,
	stacked: true,
} as any;

function TracerViewCanvas() {
	function rand() {
		return Math.random() * 100;
	}
	const [configOptions, setConfigOptions] = React.useState(options);

	React.useEffect(() => {
		setInterval(() => {
			for (const station of STATIONS_DATA) {
				stations[station.code].datasets[0].data.push({
					x: Date.now(),
					y: rand(),
				});
			}

			const newConfigOptions = {
				...configOptions,
			};
			setConfigOptions(newConfigOptions);
		}, 1000);

		setInterval(() => {
			stations["BBJI"].datasets[1].data.push(
				{
					x: Date.now(),
					y: -100000,
				},
				{
					x: Date.now(),
					y: 100000,
				},
				{
					x: null,
					y: null,
				}
			);
		}, 5000);
	}, []);

	console.log("stations", stations["BBJI"].datasets);

	return (
		<section className="overflow-hidden w-screen h-screen relative">
			<div
				className="overflow-y-auto overflow-x-hidden h-full pr-10 pt-10"
				style={{ paddingBottom: "100px" }}
			>
				{/* <div className="w-full h-[200px]"> */}
				{/* </div> */}
				{Object.keys(stations).map((station, index) => {
					return (
						// <RenderIfVisible key={index} defaultHeight={ESTIMATED_ITEM_HEIGHT}>
						<div key={index}>
							<Line
								data={stations[station]}
								options={configOptions}
								width={"100%"}
								height={100}
							/>
						</div>
						// </RenderIfVisible>
					);
				})}
			</div>

			<div className="absolute z-50 bottom-0 left-0 right-[58px]"></div>
		</section>
	);
}

export default TracerViewCanvas;
