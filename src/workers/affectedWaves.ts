import { GeoJsonCollection, RegionType } from "@/types/_index";
import * as turf from "@turf/turf";

let isOnMessageAffectedWaves = false;

const onmessage = async (event: MessageEvent) => {
	const {
		nearestRegencies,
		pWave,
		pWaveImpacted,
		sWave,
		sWaveImpacted,
		earthquakeDetection,
	} = event.data;

	if (isOnMessageAffectedWaves) {
		return;
	}

	isOnMessageAffectedWaves = true;
	try {
		//setup provinces geojson
		let geoJson: GeoJsonCollection = {
			type: "FeatureCollection",
			features: [],
		};

		//setup regencies data
		let newPWaveImpacted: RegionType[] = pWaveImpacted;
		let newSWaveImpacted: RegionType[] = sWaveImpacted;

		// remove provinces that already impact
		let currentRegenciesNotImpactSWave: RegionType[] = [];
		currentRegenciesNotImpactSWave = nearestRegencies.slice(
			sWaveImpacted.length
		);

		if (currentRegenciesNotImpactSWave.length == 0) {
			postMessage({
				message: "stop",
			});
			return;
		}

		let stopPWave = false;
		let stopSWave = false;
		for (const regency of currentRegenciesNotImpactSWave) {
			if (stopPWave && stopSWave) break;

			const response = await fetch(
				`/api/ina-geojson/${regency.province_id}/${regency.id}`
			);
			if (!response.ok) {
				continue;
			}
			const regencyGeoJson = await response.json();
			if (regencyGeoJson) {
				let regencyPolygon:
					| turf.helpers.MultiPolygon
					| turf.helpers.Polygon
					| turf.helpers.Feature<
							turf.helpers.MultiPolygon | turf.helpers.Polygon,
							{ [name: string]: any }
					  >;

				if (regencyGeoJson.features[0].geometry.type === "MultiPolygon") {
					regencyPolygon = turf.multiPolygon(
						regencyGeoJson.features[0].geometry.coordinates
					);
				} else {
					regencyPolygon = turf.polygon(
						regencyGeoJson.features[0].geometry.coordinates
					);
				}

				if (pWave && !stopPWave && pWaveImpacted.find((e: RegionType) => e.id === regency.id) === undefined) {
					const isIntersect = turf.intersect(
						regencyPolygon,
						turf.polygon(pWave.geometry.coordinates)
					);
					if (isIntersect) {
						newPWaveImpacted.push(regency);
						geoJson.features.push(...regencyGeoJson.features);
					} else {
						stopPWave = true;
					}
				}

				if (sWave && !stopSWave && sWaveImpacted.find((e: RegionType) => e.id === regency.id) === undefined) {
					const isIntersect = turf.intersect(
						regencyPolygon,
						turf.polygon(sWave.geometry.coordinates)
					);
					if (isIntersect) {
						// calculate intensity
						const distance = turf.distance(
							turf.point([earthquakeDetection.long, earthquakeDetection.lat]),
							turf.point([regency.longitude, regency.latitude])
						);
						const intensity =
							parseFloat(earthquakeDetection.mag) > 0
								? parseFloat(earthquakeDetection.mag) -
								  Math.round(distance / 100)
								: 0;
						if (intensity < 1) {
							//stop simulation
							postMessage({
								message: "stop",
							});
							stopSWave = true;
							continue;
						}
						regency.intensity = intensity;
						newSWaveImpacted.push(regency);
					} else {
						stopSWave = true;
					}
				}
			}
		}
		postMessage({
			pWaveImpacted: pWaveImpacted,
			pWaveImpactedGeoJson: geoJson,
			sWaveImpacted: sWaveImpacted,
		});
	} catch (error) {
		console.error(error);
	} finally {
		isOnMessageAffectedWaves = false;
	}
};

addEventListener("message", onmessage);
