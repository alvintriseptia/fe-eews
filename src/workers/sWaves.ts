import { CoordinateType } from "@/types/_index";
import * as turf from "@turf/turf";

let sWaveRadius = 0;
let intervalId: NodeJS.Timeout;
const updateFrequency = 500;

const onmessage = (event: MessageEvent) => {
	const { command, earthquakeEpicenter } = event.data;
	if (command === "stop") {
		clearInterval(intervalId);
		return;
	}

	if (command === "start") {
		sWaveRadius = 0;
		intervalId = setInterval(() => {
			runSWave(earthquakeEpicenter);
		}, updateFrequency);
	}

	function runSWave(center: CoordinateType) {
		sWaveRadius += Math.random() * (2.5 - 1.5) + 1.5;
		const centerPoint = turf.point([center.longitude, center.latitude]);
		const options = { steps: 25 }; 
		const sWavePolygon = turf.circle(centerPoint, sWaveRadius, options);

		postMessage({
			sWave: sWavePolygon,
			radius: sWaveRadius,
		});
	}
};

addEventListener("message", onmessage);
