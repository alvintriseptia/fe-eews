import React from "react";
import ChartJS from "chart.js/auto";

type XScale = {
	min: number;
	max: number;
};

interface Props {
	onTimeUpdate: (scale: XScale) => void;
	maxTime: number;
}

const options = {
	scales: {
		x: {
			type: "time",
			ticks: {
				color: "white",
			},
			grid: {
				display: false,
			},
		},
		y: {
			display: false,
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
	animation: false,
	spanGaps: true,
} as any;
function CanvasTimeChart(props: Props) {
	React.useEffect(() => {
		if (!document.getElementById(`trace-view-timestamp`)) return;

		const ctx = document.getElementById(
			`trace-view-timestamp`
		) as HTMLCanvasElement;
		const chart = new ChartJS(ctx, {
			type: "line",
			data: {
				datasets: [],
			},
			options: {
				...options,
				scales: {
					...options.scales,
					x: {
						...options.scales.x,
						min: new Date().getTime() - (props.maxTime / 2),
						max: new Date().getTime() + (props.maxTime / 2),
					},
				},
			},
		});

		setInterval(() => {
			const now = new Date().getTime();
			const currentTime = chart.options.scales.x.max as number;
			if (now > currentTime) {
				chart.options.scales.x.min = now - (props.maxTime / 2);
				chart.options.scales.x.max = now + (props.maxTime / 2);
				props.onTimeUpdate({
					min: now,
					max: now + props.maxTime,
				});
				chart.update();
			}
		}, 1000);
	}, []);

	return (
		<canvas
			id={`trace-view-timestamp`}
			style={{ width: "100%", height: "80px" }}
		/>
	);
}

export default CanvasTimeChart;
