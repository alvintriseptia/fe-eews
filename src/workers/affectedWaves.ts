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
		let regenciesData: RegionType[] = sWaveImpacted;

		// remove provinces that already impact
		let currentRegenciesNotImpactSWave: RegionType[] = [];
		currentRegenciesNotImpactSWave = nearestRegencies.slice(
			sWaveImpacted.length
		);

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
			if (regencyGeoJson && pWave && !stopPWave) {
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

				const isIntersect = turf.intersect(
					regencyPolygon,
					turf.polygon(pWave.geometry.coordinates)
				);
				if (
					isIntersect &&
					pWaveImpacted.features.find(
						(e: RegionType) => e.id === regency.id
					) === undefined
				) {
					geoJson.features.push(...regencyGeoJson.features);
				} else {
					stopPWave = true;
				}
			}

			if (regencyGeoJson && sWave && !stopSWave) {
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
						stopSWave = true;
						continue;
					}
					regency.intensity = intensity;
					regenciesData.push(regency);
				} else {
					stopSWave = true;
				}
			}
		}

		const newFeatures: any[] = pWaveImpacted.features;
		if (geoJson.features.length) {
			geoJson.features.forEach((feature: any) => {
				if (
					!newFeatures.find(
						(e: any) => e.properties.Code === feature.properties.Code
					)
				) {
					newFeatures.push(feature);
				}
			});
		}

		let newSWaveImpacted: RegionType[] = regenciesData;
		if (sWaveImpacted.length > 0) {
			sWaveImpacted.forEach((regency: RegionType) => {
				if (
					!newSWaveImpacted.find((e: RegionType) => e.id === regency.id) &&
					regency.intensity
				) {
					newSWaveImpacted.push(regency);
				}
			});
		}

		postMessage({
			pWaveImpacted: {
				...geoJson,
				features: newFeatures,
			},
			sWaveImpacted: newSWaveImpacted,
		});
	} catch (error) {
		console.error(error);
	} finally {
		isOnMessageAffectedWaves = false;
	}
};

addEventListener("message", onmessage);
