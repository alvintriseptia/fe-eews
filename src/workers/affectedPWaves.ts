import { GeoJsonCollection, RegionType } from "@/types/_index";
import * as turf from "@turf/turf";

let isOnMessageAffectedPWaves = false;

const onmessage = async (event: MessageEvent) => {
	const { nearestRegencies, pWave, pWaveImpacted } = event.data;
	if (isOnMessageAffectedPWaves) {
		return;
	}

	isOnMessageAffectedPWaves = true;
	try {
		//setup provinces geojson
		let geoJson: GeoJsonCollection = {
			type: "FeatureCollection",
			features: [],
		};

		// remove provinces that already impact
		let currentRegenciesNotImpact: RegionType[] = [];
		currentRegenciesNotImpact = nearestRegencies.slice(
			pWaveImpacted.features.length
		);

		for (const regency of currentRegenciesNotImpact) {
			const response = await fetch(
				`/api/ina-geojson/${regency.province_id}/${regency.id}`
			);
			if (!response.ok) {
				continue;
			}
			const regencyGeoJson = await response.json();
			if (regencyGeoJson && pWave) {
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
					break;
				}
			}
		}

		if(geoJson.features.length === 0){
			return;
		}

		const newFeatures: any[] = [];
		geoJson.features.forEach((feature: any) => {
			if (
				!newFeatures.find(
					(e: any) => e.properties.Code === feature.properties.Code
				)
			) {
				newFeatures.push(feature);
			}
		});

		pWaveImpacted.features.forEach((feature: any) => {
			if (
				!newFeatures.find(
					(e: any) => e.properties.Code === feature.properties.Code
				)
			) {
				newFeatures.push(feature);
			}
		});

		postMessage({
			...geoJson,
			features: newFeatures,
		});
	} catch (error) {
		console.error(error);
	} finally {
		isOnMessageAffectedPWaves = false;
	}
};

addEventListener("message", onmessage);
