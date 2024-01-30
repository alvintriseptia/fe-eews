import { GeoJsonCollection, RegionType } from "@/types/_index";
import * as turf from "@turf/turf";

let isOnMessage = false;

const onmessage = async (event: MessageEvent) => {
	const { nearestRegencies, sWave, sWaveImpacted, earthquakeDetection } = event.data;
	if (isOnMessage) {
		return;
	}

	isOnMessage = true;
	try {
		//setup regencies data
		let regenciesData: RegionType[] = [];

		// remove provinces that already impact
		let currentRegenciesNotImpact: RegionType[] = [];
		
		currentRegenciesNotImpact = nearestRegencies.slice(
			sWaveImpacted.length
		);

		for (const regency of currentRegenciesNotImpact) {
			const response = await fetch(
				`/api/ina-geojson/${regency.province_id}/${regency.id}`
			);
			if (!response.ok) {
				continue;
			}
			const regencyGeoJson = await response.json();
			if (regencyGeoJson && sWave) {
				let regencyPolygon: turf.helpers.MultiPolygon | turf.helpers.Polygon | turf.helpers.Feature<turf.helpers.MultiPolygon | turf.helpers.Polygon,{ [name: string]: any }>;

				if (regencyGeoJson.features[0].geometry.type === "MultiPolygon") {
					regencyPolygon = turf.multiPolygon(
						regencyGeoJson.features[0].geometry.coordinates
					);
				} else {
					regencyPolygon = turf.polygon(
						regencyGeoJson.features[0].geometry.coordinates
					);
				}

				const isIntersect = turf.intersect(
					regencyPolygon,
					turf.polygon(sWave.geometry.coordinates)
				);
				if (
					isIntersect &&
					sWaveImpacted.find((e: RegionType) => e.id === regency.id) ===
						undefined
				) {
					// calculate intensity
					const distance = turf.distance(
						turf.point([earthquakeDetection.long, earthquakeDetection.lat]),
						turf.point([regency.longitude, regency.latitude])
					);
					const intensity =
						parseFloat(earthquakeDetection.mag) > 0
							? parseFloat(earthquakeDetection.mag) - Math.round(distance / 100)
							: 0;
					if (intensity < 1) {
						//stop simulation
						postMessage({
							message: "stop",
						});
						continue;
					}
					regency.intensity = intensity;
					regenciesData.push(regency);
				} else {
					break;
				}
			}
		}

		if(regenciesData.length === 0){
			return;
		}

		let newSWaveImpacted: RegionType[] = [];

		if(sWaveImpacted.length > 0){
			newSWaveImpacted.push(...sWaveImpacted);
		}

		newSWaveImpacted.push(...regenciesData);

		postMessage({
			message: "update",
			sWaveImpacted: newSWaveImpacted,
		});
	} catch (error) {
		console.error(error);
	} finally {
		isOnMessage = false;
	}
};

addEventListener("message", onmessage);
