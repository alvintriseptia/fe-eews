import { CoordinateType } from "@/types/_index";
import * as turf from "@turf/turf";

let sWaveRadius = 0;
let pWaveRadius = 0;
let waveInterval: NodeJS.Timeout;
const updateFrequency = 2000;
let isOnMessageWaves = false;

const onmessage = (event: MessageEvent) => {
	const { command, earthquakeEpicenter, type } = event.data;
	if(type == "waves") {
		if (command === "stop") {
			sWaveRadius = 0;
			pWaveRadius = 0;
			isOnMessageWaves = false;
			clearInterval(waveInterval);
			return;
		}
	
		if (command === "start") {
			sWaveRadius = 0;
			pWaveRadius = 0;
			waveInterval = setInterval(() => {
				if (isOnMessageWaves) return;
				runWave(earthquakeEpicenter);
			}, updateFrequency);
		}
	}
};

function runWave(center: CoordinateType) {
	isOnMessageWaves = true;
	sWaveRadius += Math.random() * 2 + 6;
	pWaveRadius += (Math.random() * 2) + 10;
	
	const centerPoint = turf.point([center.longitude, center.latitude]);
	const options = { steps: 25 };
	const sWavePolygon = turf.circle(centerPoint, sWaveRadius, options);
	const pWavePolygon = turf.circle(centerPoint, pWaveRadius, options);

	postMessage({
		sWave: sWavePolygon,
		pWave: pWavePolygon,
	});
	isOnMessageWaves = false;
}

addEventListener("message", onmessage);
