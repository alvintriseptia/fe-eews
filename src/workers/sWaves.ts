import { CoordinateType } from "@/types/_index";
import * as turf from "@turf/turf";

let sWaveRadius = 0;
let sWaveInterval: NodeJS.Timeout;
const updateFrequency = 500;
let isOnMessageSWaves = false;

const onmessage = (event: MessageEvent) => {
	const { command, earthquakeEpicenter } = event.data;
	if (command === "stop") {
		sWaveRadius = 0;
		isOnMessageSWaves = false;
		clearInterval(sWaveInterval);
		return;
	}

	if (command === "start") {
		sWaveRadius = 0;
		sWaveInterval = setInterval(() => {
			if(isOnMessageSWaves) return;
			runSWave(earthquakeEpicenter);
		}, updateFrequency);
	}

	function runSWave(center: CoordinateType) {
		isOnMessageSWaves = true;
		sWaveRadius += Math.random() * (2.5 - 1.5) + 1.5;
		const centerPoint = turf.point([center.longitude, center.latitude]);
		const options = { steps: 25 }; 
		const sWavePolygon = turf.circle(centerPoint, sWaveRadius, options);

		postMessage({
			sWave: sWavePolygon,
			radius: sWaveRadius,
		});
		isOnMessageSWaves = false;
	}
};

addEventListener("message", onmessage);
