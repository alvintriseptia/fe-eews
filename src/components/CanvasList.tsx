import React from "react";
import CanvasLineChart from "./CanvasLineChart";
import CanvasTimeChart from "./CanvasTimeChart";
import RenderIfVisible from "react-render-if-visible";
const MAX_TIME = 5 * (60 * 1000); // minutes in milliseconds
const ESTIMATED_HEIGHT = 200; // px

interface Props {
	seismograms: string[];
	onClickStation: (station: string) => void;
	type: string;
}

function CanvasList(props: Props) {
	const [xScale, setXScale] = React.useState({
		min: new Date().getTime() - MAX_TIME / 2,
		max: new Date().getTime() + MAX_TIME / 2,
	});

	return (
		<div className="relative">
			{props.seismograms.map((station, index) => {
				return (
					<RenderIfVisible key={station} defaultHeight={ESTIMATED_HEIGHT}>
						<div className="relative">
							<div className="flex justify-between absolute top-0 left-0 right-0 z-50">
								<div className="px-1 h-8 flex items-center justify-center rounded bg-tews-mmi-VI text-white text-xs relative translate-x-16">
									{station} ...Z
								</div>

								<button
									className={`text-white px-4 py-2 rounded-md text-xs m-2 ${
										props.type === "disabled" ? "bg-tews-blue" : "bg-tews-mmi-X"
									}`}
									onClick={() => props.onClickStation(station)}
								>
									{props.type === "disabled" ? "Aktifkan" : "Nonaktifkan"}
								</button>
							</div>

							<div className="w-full relative">
								<CanvasLineChart
									station={station}
									xMin={xScale.min}
									xMax={xScale.max}
								/>

								{props.type === "disabled" && (
									<div className="absolute top-0 left-0 right-0 bottom-0 z-40 bg-tews-mmi-I/20" />
								)}
							</div>
						</div>
					</RenderIfVisible>
				);
			})}

			<div className="h-[100px]"></div>

			<div className="fixed bottom-0 left-10 right-0 h-[80px] bg-tews-cinder pb-4 z-[99]">
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
