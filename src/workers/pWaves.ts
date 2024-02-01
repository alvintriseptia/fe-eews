import { CoordinateType } from "@/types/_index";
import * as turf from "@turf/turf";

let pWaveInterval: NodeJS.Timeout;
let pWaveRadius = 0;
const updateFrequency = 2000;
let isOnMessagePWaves = false;

const onmessage = (event: MessageEvent) => {
	const { command, earthquakeEpicenter } = event.data;

	if (command === "stop") {
		pWaveRadius = 0;
		isOnMessagePWaves = false;
		clearInterval(pWaveInterval);
		return;
	}

	if (command === "start") {
		pWaveRadius = 0;
		pWaveInterval = setInterval(() => {
			if(isOnMessagePWaves) return;
			runPWave(earthquakeEpicenter);
		}, updateFrequency);
	}
	function runPWave(waveCenter: CoordinateType) {
		isOnMessagePWaves = true;
		pWaveRadius += (Math.random() * 2) + 10;
		const center = turf.point([waveCenter.longitude, waveCenter.latitude]);
		const options = { steps: 25 };
		const pWavePolygon = turf.circle(center, pWaveRadius, options);
		postMessage({
			pWave: pWavePolygon,
			radius: pWaveRadius,
		});
		isOnMessagePWaves = false;
	}
};

addEventListener("message", onmessage);
