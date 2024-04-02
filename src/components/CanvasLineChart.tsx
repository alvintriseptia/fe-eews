import StationController from "@/controllers/StationController";
import { observe } from "mobx";
import React from "react";
import { Line } from "react-chartjs-2";
import ChartJS from "chart.js/auto";
import { TimeScale } from "chart.js";
import "chartjs-adapter-luxon";
import { SeismogramDataType } from "@/workers/seismogram";
ChartJS.register(TimeScale);

interface Props {
	station: string;
	xMin: number;
	xMax: number;
}
const SAMPLING_RATE = 20;
const BUFFER = 5000;

const options = {
	scales: {
		x: {
			type: "time",
			ticks: {
				color: "white",
			},
			display: false,
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
			ticks: {
				color: "white",
			},
		},
	},
	responsive: true,
	plugins: {
		legend: {
			display: false,
		},
		title: {
			display: false,
		},
	},
	maintainAspectRatio: false,
	stacked: true,
	animation: false,
	spanGaps: true,
} as any;
function CanvasLineChart(props: Props) {
	const data = React.useMemo(() => {
		return {
			datasets: [
				{
					data: [],
					label: props.station + "..Z",
					backgroundColor: "#00b7ff",
					borderColor: "#00b7ff",
					borderWidth: 1,
					showLegend: false,
					yAxisID: "y",
					pointRadius: 0,
					order: 1,
				},
				{
					data: [],
					label: "P-Wave Arrival",
					backgroundColor: "#ff0000",
					borderColor: "#ff0000",
					borderWidth: 1,
					yAxisID: "y2",
					pointRadius: 0,
					order: 0,
				},
			],
		} as any;
	}, [props.station]);
	const chart = React.useRef<ChartJS | null>(null);

	React.useEffect(() => {
		if (!props.station) return;
		if (!document.getElementById(`trace-view-${props.station}`)) return;
		const ctx = document.getElementById(
			`trace-view-${props.station}`
		) as HTMLCanvasElement;
		chart.current = new ChartJS(ctx, {
			type: "line",
			data: data,
			options: {
				...options,
				scales: {
					...options.scales,
					x: {
						...options.scales.x,
						min: props.xMin,
						max: props.xMax,
					},
				},
			},
		});

		const stationController = StationController.getInstance();
		stationController.getLastSeismogramData(props.station);
		const seismogram = stationController.seismograms.get(props.station);
		observe(seismogram, "rerender", (change) => {
			if (change.newValue > 0 && seismogram.seismogramData) {
				const newData = seismogram.seismogramData as SeismogramDataType;
				const { channelZ, channelN, channelE, pWaves } = newData;

				data.datasets[0].data = channelZ;
				data.datasets[1].data = pWaves;

				chart.current?.update();
			}
		});
	}, []);

	React.useEffect(() => {
		if (chart.current) {
			chart.current.options.scales.x.min = props.xMin;
			chart.current.options.scales.x.max = props.xMax;
			chart.current.update();
		}
	}, [props.xMin, props.xMax]);

	return (
		<canvas
			id={`trace-view-${props.station}`}
			style={{ width: "100%", height: "100px" }}
		/>
	);
}

export default CanvasLineChart;
