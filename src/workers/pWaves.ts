import { CoordinateType } from "@/types/_index";
import * as turf from "@turf/turf";

let pWaveInterval: NodeJS.Timeout;
let pWaveRadius = 0;
const updateFrequency = 500;

const onmessage = (event: MessageEvent) => {
	const { command, earthquakeEpicenter } = event.data;

	if (command === "stop") {
		pWaveRadius = 0;
		clearInterval(pWaveInterval);
		return;
	}

	if (command === "start") {
		pWaveRadius = 0;
		pWaveInterval = setInterval(() => {
			runPWave(earthquakeEpicenter);
		}, updateFrequency);
	}
	function runPWave(waveCenter: CoordinateType) {
		pWaveRadius += Math.random() * (3.5 - 2.5) + 2.5;
		const center = turf.point([waveCenter.longitude, waveCenter.latitude]);
		const options = { steps: 25 };
		const pWavePolygon = turf.circle(center, pWaveRadius, options);
		postMessage({
			pWave: pWavePolygon,
			radius: pWaveRadius,
		});
	}
};

addEventListener("message", onmessage);
