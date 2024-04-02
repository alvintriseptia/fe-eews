import React from "react";
import CanvasLineChart from "./CanvasLineChart";
import CanvasTimeChart from "./CanvasTimeChart";
import { IStation } from "@/entities/IStation";
const MAX_TIME = 5 * ( 60 * 1000); // minutes in milliseconds

interface Props {
	seismograms: IStation[];
	onDisableStation: (station: string) => void;
}

function CanvasList(props: Props) {
	const [xScale, setXScale] = React.useState({
		min: new Date().getTime() - (MAX_TIME / 2),
		max: new Date().getTime() + (MAX_TIME / 2),
	});

	console.log("rendering canvas list");

	return (
		<div className="relative">
			{props.seismograms.map((station, index) => {
				return (
					<div className="relative" key={station.code}>
						<div className="flex justify-between absolute top-0 left-0 right-0">
							<div className="px-1 h-8 flex items-center justify-center rounded bg-tews-mmi-VI text-white text-xs relative translate-x-16">
								{station.code} ...Z
							</div>

							<button
								className="bg-tews-mmi-X text-white px-4 py-2 rounded-md text-xs m-2"
								onClick={() => props.onDisableStation(station.code)}
							>
								Nonaktifkan
							</button>
						</div>

						<div className="w-full">
							<CanvasLineChart
								station={station.code}
								xMin={xScale.min}
								xMax={xScale.max}
							/>
						</div>
					</div>
				);
			})}

			<div className="h-[100px]"></div>

			<div className="fixed bottom-0 left-10 right-0 h-[80px] bg-tews-cinder pb-4">
				<CanvasTimeChart
					onTimeUpdate={(scale) => {
						setXScale(scale);
					}}
					maxTime={MAX_TIME}
				/>
			</div>
		</div>
	);
}

export default CanvasList;
