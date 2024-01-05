import { IEarthquakePrediction, IMap, IStation } from "@/entities/_index";
import { CoordinateType, GeoJsonCollection, RegionType } from "@/types/_index";
import MapLibreGL, { StyleSpecification } from "maplibre-gl";
import { Map as MapLibre } from "maplibre-gl";
import BallMarker from "@/assets/images/ball-marker.ico";
import { getIntensityColor } from "@/utils/map-style";

class EEWSMap implements IMap {
	id: string;
	zoom: number;
	initialViewState: CoordinateType;
	mapStyle: string | StyleSpecification;
	map: MapLibre;
	sWaveAffectedMarker: Map<string, maplibregl.Marker> = new Map();
	earthquakeEpicenter: maplibregl.Marker;
	stationMarker: maplibregl.Marker;
	earthquakePredictionMarker: Map<string, maplibregl.Marker> = new Map();

	initMap(map: IMap) {
		this.id = map.id;
		this.zoom = map.zoom;
		this.initialViewState = map.initialViewState;
		this.mapStyle = map.mapStyle;

		this.map = new MapLibreGL.Map({
			container: this.id,
			style: this.mapStyle,
			center: [this.initialViewState.longitude, this.initialViewState.latitude],
			zoom: this.zoom,
			attributionControl: true,
		});

		// add fullscreen control
		this.map.addControl(new MapLibreGL.FullscreenControl(), "top-left");
		// add navigation control
		this.map.addControl(new MapLibreGL.NavigationControl(), "top-left");

		this.map.on("load", () => {
			if (!this.map.getSource("pWaveAffected")) {
				this.map.addSource("pWaveAffected", {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [],
					},
				});
			}

			if (!this.map.getSource("pWave")) {
				this.map.addSource("pWave", {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [
							{
								type: "Feature",
								geometry: {
									type: "Point",
									coordinates: [],
								},
							},
						],
					},
				});
			}

			if (!this.map.getSource("sWave")) {
				this.map.addSource("sWave", {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [
							{
								type: "Feature",
								geometry: {
									type: "Point",
									coordinates: [],
								},
							},
						],
					},
				});
			}

			if (!this.map.getLayer("pWave")) {
				this.map.addLayer({
					id: "pWave",
					source: "pWave",
					type: "fill",
					paint: {
						"fill-outline-color": "#0000ff",
						"fill-color": "transparent",
					},
				});
			}

			if (!this.map.getLayer("sWave")) {
				this.map.addLayer({
					id: "sWave",
					source: "sWave",
					type: "fill",
					paint: {
						"fill-outline-color": "#ff0000",
						"fill-color": "transparent",
					},
				});
			}

			if (!this.map.getLayer("pWaveAffected")) {
				this.map.addLayer({
					id: "pWaveAffected",
					source: "pWaveAffected",
					type: "fill",
					paint: {
						"fill-color": "#ff0000",
						"fill-opacity": 0.2,
					},
				});
			}
		});
	}

	setOnViewCenter(coordinates: CoordinateType, zoom?: number) {
		this.map.setCenter([coordinates.longitude, coordinates.latitude]);

		if (zoom) {
			this.map.setZoom(zoom);
		}
	}

	addStations(stations: IStation[]) {
		stations.forEach((station) => {
			const el = document.createElement("div");
			const innerEl = `
                <div class="station-marker">
					<Image src="${BallMarker.src}" width="24" height="24" alt="station" />
                    <div class="station-marker__code text-white">${station.code}</div>
                </div>
            `;
			el.innerHTML = innerEl;
			new MapLibreGL.Marker({
				color: "red",
				draggable: false,
				scale: 0.5,
				element: el,
			})
				.setLngLat([station.longitude, station.latitude])
				.addTo(this.map)
				.setPopup(
					new MapLibreGL.Popup({
						closeButton: false,
						closeOnClick: false,
					}).setHTML(`<div>
									<h3>${station.description}</h3>
									<div>Didirikan: ${new Date(station.creation_date).toLocaleString()}</div>
								</div>
						`)
				);
		});
	}

	async getAreaName(coordinate: CoordinateType) {
		try {
			const response = await fetch(
				`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinate.latitude}&longitude=${coordinate.longitude}&localityLanguage=id`
			);
			const data = await response.json();

			let address = "";

			if (data.locality) address += data.locality;
			if (data.principalSubdivision)
				address += `, ${data.principalSubdivision}`;

			return address;
		} catch (error) {
			console.error(error);
			return "";
		}
	}

	addEarthquakePrediction(location: CoordinateType, station: IStation) {
		const el = document.createElement("div");
		const innerEl = `
			<div class="animate-pulse font-bold text-4xl text-red-500 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">
				&#x2715;
			</div>
			`;
		el.innerHTML = innerEl;
		this.earthquakeEpicenter = new MapLibreGL.Marker({
			draggable: false,
			scale: 1,
			element: el,
		})
			.setLngLat([location.longitude, location.latitude])
			.addTo(this.map);

		// add pulse circle at station
		const pulseCircle = document.createElement("div");
		pulseCircle.innerHTML = `<div class="animate-pulse bg-eews-mmi-X/40 rounded-full relative -z-10 w-12 h-12"></div>`;

		this.stationMarker = new MapLibreGL.Marker({
			draggable: false,
			scale: 1,
			element: pulseCircle,
		})
			.setLngLat([station.longitude, station.latitude])
			.addTo(this.map);

		this.map.flyTo({
			center: [location.longitude, location.latitude],
			zoom: 7,
			speed: 1.4,
			curve: 1,
			easing(t) {
				return t;
			},
			essential: true,
		});
	}

	clearEarthquakePrediction() {
		if (this.map.getSource("pWave")) {
			const source = this.map.getSource("pWave") as maplibregl.GeoJSONSource;
			source.setData({
				type: "FeatureCollection",
				features: [],
			});
		}

		if (this.map.getSource("sWave")) {
			const source = this.map.getSource("sWave") as maplibregl.GeoJSONSource;
			source.setData({
				type: "FeatureCollection",
				features: [],
			});
		}

		// check if exist
		if (this.map.getSource("pWaveAffected")) {
			const source = this.map.getSource(
				"pWaveAffected"
			) as maplibregl.GeoJSONSource;
			source.setData({
				type: "FeatureCollection",
				features: [],
			});
		}

		if (this.sWaveAffectedMarker.size > 0) {
			this.sWaveAffectedMarker.forEach((marker) => marker.remove());
			this.sWaveAffectedMarker.clear();
		}

		if (this.earthquakeEpicenter) {
			this.earthquakeEpicenter.remove();
		}

		if (this.stationMarker) {
			this.stationMarker.remove();
		}
	}

	simulatePWaves(pWave: any) {
		// get source
		const source = this.map.getSource("pWave") as maplibregl.GeoJSONSource;

		// update source
		if (source) {
			source.setData(pWave);
		}
	}

	simulateSWaves(sWave: any) {
		// get source
		const source = this.map.getSource("sWave") as maplibregl.GeoJSONSource;

		// update source
		if (source) {
			source.setData(sWave);
		}
	}

	stopSimulation() {
		//remove layer
		if (this.map.getSource("pWave")) {
			const source = this.map.getSource("pWave") as maplibregl.GeoJSONSource;
			source.setData({
				type: "FeatureCollection",
				features: [],
			});
		}

		if (this.map.getSource("sWave")) {
			const source = this.map.getSource("sWave") as maplibregl.GeoJSONSource;
			source.setData({
				type: "FeatureCollection",
				features: [],
			});
		}
	}

	addAreaAffectedPWave(areas: any) {
		// add area affected
		const source = this.map.getSource(
			"pWaveAffected"
		) as maplibregl.GeoJSONSource;

		// update source
		if (source) {
			source.setData(areas);
		}
	}

	addAreaAffectedSWave(regencies: RegionType[]) {
		// add area affected
		regencies.forEach((regency) => {
			if (this.sWaveAffectedMarker.has(regency.id.toString())) {
				return;
			}

			const el = document.createElement("div");
			const innerEl = `
			<div class="font-bold text-lg w-[24px] h-[24px] flex justify-center items-center rounded-full ${
				Math.round(regency.intensity) === 1 ? "text-gray-900" : "text-white"
			} ${getIntensityColor(
				Math.round(regency.intensity)
			)} hover:scale-110 transform transition-all duration-300 ease-in-out">
				${Math.round(regency.intensity)}
			</div>
			`;
			el.innerHTML = innerEl;
			const marker = new MapLibreGL.Marker({
				draggable: false,
				scale: 0.5,
				element: el,
			})
				.setLngLat([regency.longitude, regency.latitude])
				.addTo(this.map);

			this.sWaveAffectedMarker.set(regency.id.toString(), marker);
		});
	}

	addEarthquakePredictionLocations(earthquake: IEarthquakePrediction[]) {
		// add area affected
		earthquake.forEach((eq) => {
			const el = document.createElement("div");
			const bgColor = getIntensityColor(eq.mag);
			const innerEl = `
			<div class="font-bold text-sm w-[24px] h-[24px] flex justify-center items-center rounded-full ${bgColor} hover:scale-110 transform transition-all duration-300 ease-in-out relative" style="z-index: ${Math.round(
				eq.mag
			)}">
				${eq.mag?.toFixed(1)}
			</div>
			`;

			const popupInnerEl = `
			<div class="text-xs">
				<div>Magnitude: ${eq.mag?.toFixed(1)}</div>
				<div>${new Date(eq.time_stamp).toLocaleString()}</div>
				<div>${eq.location || ""}</div>	
			</div>
			`;

			el.innerHTML = innerEl;
			const marker = new MapLibreGL.Marker({
				draggable: false,
				scale: 0.5,
				element: el,
			})
				.setLngLat([eq.long, eq.lat])
				.addTo(this.map)
				.setPopup(
					new MapLibreGL.Popup({
						closeButton: false,
						closeOnClick: false,
					}).setHTML(popupInnerEl)
				);

			this.earthquakePredictionMarker.set(eq.time_stamp.toString(), marker);
		});
	}
}
export default EEWSMap;
