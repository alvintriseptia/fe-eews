import { IEarthquakeDetection, IMap, IStation } from "@/entities/_index";
import { CoordinateType,  RegionType } from "@/types/_index";
import MapLibreGL, { StyleSpecification } from "maplibre-gl";
import { Map as MapLibre } from "maplibre-gl";
import { getIntensityColor } from "@/utils/map-style";

class TEWSMap implements IMap {
	id: string;
	zoom: number;
	initialViewState: CoordinateType;
	mapStyle: string | StyleSpecification;
	map: MapLibre;
	sWaveAffectedMarker: Map<string, maplibregl.Marker> = new Map();
	earthquakeEpicenter: maplibregl.Marker;
	stationMarker: maplibregl.Marker;
	earthquakeDetectionMarker: Map<string, maplibregl.Marker> = new Map();
	stationLocationMarker: Map<string, maplibregl.Marker> = new Map();

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
		// clear station location marker
		if (this.stationLocationMarker.size > 0) {
			this.stationLocationMarker.forEach((marker) => marker.remove());
			this.stationLocationMarker.clear();
		}

		const offset = new Date().getTimezoneOffset() * 60 * 1000;
		const timezone = -(new Date().getTimezoneOffset() / 60);
		const timezoneText =
			timezone === 7
				? "WIB"
				: timezone === 8
				? "WITA"
				: timezone === 9
				? "WIT"
				: "";

		stations.forEach((station) => {
			const colorsSorted = {};
			if (station.color1) {
				if (!colorsSorted[station.color1]) {
					colorsSorted[station.color1] = 1;
				} else {
					colorsSorted[station.color1] += 1;
				}
			}
			if (station.color2) {
				if (!colorsSorted[station.color2]) {
					colorsSorted[station.color2] = 1;
				} else {
					colorsSorted[station.color2] += 1;
				}
			}
			if (station.color3) {
				if (!colorsSorted[station.color3]) {
					colorsSorted[station.color3] = 1;
				} else {
					colorsSorted[station.color3] += 1;
				}
			}
			if (station.color4) {
				if (!colorsSorted[station.color4]) {
					colorsSorted[station.color4] = 1;
				} else {
					colorsSorted[station.color4] += 1;
				}
			}
			if (station.color5) {
				if (!colorsSorted[station.color5]) {
					colorsSorted[station.color5] = 1;
				} else {
					colorsSorted[station.color5] += 1;
				}
			}
			if (station.color6) {
				if (!colorsSorted[station.color6]) {
					colorsSorted[station.color6] = 1;
				} else {
					colorsSorted[station.color6] += 1;
				}
			}

			let mainColor = Object.keys(colorsSorted).reduce(
				(a, b) => (colorsSorted[a] > colorsSorted[b] ? a : b),
				"#fff"
			);
			if(colorsSorted['green'] && colorsSorted['green'] >= 3){
				mainColor = 'green';
			}
			
			const el = document.createElement("div");
			const innerEl = `
                <div>
					<div class="station-marker" style="border-bottom: 16px solid ${mainColor}"></div>
                    <div class="station-marker__code text-white text-center">${station.code}</div>
                </div>
            `;
			el.innerHTML = innerEl;

			let popUpHtml = `
					<div>
						<h3>${station.description}</h3>
						<div>Didirikan: ${new Date(station.creation_date).toLocaleString("id-ID")}</div>
						<table class="w-full">
							<thead>
								<tr class="text-center">
									<th>Channel</th>
									<th>Data Terakhir</th>
									<th>Latency</th>
								</tr>
							</thead>
							<tbody class="text-white">
				`;

			if (station.ch1) {
				const time = new Date(station.timech1);
				let timeText = "-";
				if (time && time.toDateString() != "Invalid Date") {
					time.setTime(time.getTime() - offset);
					timeText = time.toLocaleString("id-ID") + " " + timezoneText;
				}
				popUpHtml += `
					<tr class="w-full text-center" style="background-color: ${station.color1}">
						<td>${station.ch1}</td>
						<td>${timeText}</td>
						<td>${station.latency1}</td>
					</tr>
				`;
			}
			if (station.ch2) {
				const time = new Date(station.timech2);
				let timeText = "-";
				if (time && time.toDateString() != "Invalid Date") {
					time.setTime(time.getTime() - offset);
					timeText = time.toLocaleString("id-ID") + " " + timezoneText;
				}
				popUpHtml += `
					<tr class="w-full text-center" style="background-color: ${station.color2}">
						<td>${station.ch2}</td>
						<td>${timeText}</td>
						<td>${station.latency2}</td>
					</tr>
				`;
			}
			if (station.ch3) {
				const time = new Date(station.timech3);
				let timeText = "-";
				if (time && time.toDateString() != "Invalid Date") {
					time.setTime(time.getTime() - offset);
					timeText = time.toLocaleString("id-ID") + " " + timezoneText;
				}
				popUpHtml += `
					<tr class="w-full text-center" style="background-color: ${station.color3}">
						<td>${station.ch3}</td>
						<td>${timeText}</td>
						<td>${station.latency3}</td>
					</tr>
				`;
			}
			if (station.ch4) {
				const time = new Date(station.timech4);
				let timeText = "-";
				if (time && time.toDateString() != "Invalid Date") {
					time.setTime(time.getTime() - offset);
					timeText = time.toLocaleString("id-ID") + " " + timezoneText;
				}
				popUpHtml += `
					<tr class="w-full text-center" style="background-color: ${station.color4}">
						<td>${station.ch4}</td>
						<td>${timeText}</td>
						<td>${station.latency4}</td>
					</tr>
				`;
			}
			if (station.ch5) {
				const time = new Date(station.timech5);
				let timeText = "-";
				if (time && time.toDateString() != "Invalid Date") {
					time.setTime(time.getTime() - offset);
					timeText = time.toLocaleString("id-ID") + " " + timezoneText;
				}
				popUpHtml += `
					<tr class="w-full text-center" style="background-color: ${station.color5}">
						<td>${station.ch5}</td>
						<td>${timeText}</td>
						<td>${station.latency5}</td>
					</tr>
				`;
			}
			if (station.ch6) {
				const time = new Date(station.timech6);
				let timeText = "-";
				if (time && time.toDateString() != "Invalid Date") {
					time.setTime(time.getTime() - offset);
					timeText = time.toLocaleString("id-ID") + " " + timezoneText;
				}
				popUpHtml += `
					<tr class="w-full text-center" style="background-color: ${station.color6}">
						<td>${station.ch6}</td>
						<td>${timeText}</td>
						<td>${station.latency6}</td>
					</tr>
				`;
			}

			popUpHtml += `
							</tbody>
						</table>
					</div>
				`;
				
			const marker = new MapLibreGL.Marker({
				color: "red",
				draggable: false,
				scale: 1,
				element: el,
			})
				.setLngLat([station.longitude, station.latitude])
				.addTo(this.map)
				.setPopup(
					new MapLibreGL.Popup({
						closeButton: false,
						maxWidth: "none",
					}).setHTML(popUpHtml)
				);
			this.stationLocationMarker.set(station.code, marker);
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

	addEarthquakeDetection(location: CoordinateType, station: IStation) {
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
		pulseCircle.innerHTML = `<div class="animate-pulse bg-tews-mmi-X/40 rounded-full relative -z-10 w-12 h-12"></div>`;

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

	clearWaves(){
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

	clearEarthquakeDetection() {
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

	simulateWaves(pWave: any, sWave: any) {
		// get source
		const sourcePWave = this.map.getSource("sWave") as maplibregl.GeoJSONSource;

		// update sourcePWave
		if (sourcePWave) {
			sourcePWave.setData(sWave);
		}

		// get source
		const sourceSWave = this.map.getSource("pWave") as maplibregl.GeoJSONSource;

		// update sourceSWave
		if (sourceSWave) {
			sourceSWave.setData(pWave);
		}
	}

	addAreaAffectedWaves(pWaveImpacted: any, sWaveImpacted: RegionType[]) {
		// add area affected sWave
		sWaveImpacted.forEach((regency) => {
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
		
		// add area affected pWave
		const source = this.map.getSource(
			"pWaveAffected"
		) as maplibregl.GeoJSONSource;

		// update source
		if (source) {
			source.setData({
				type: "FeatureCollection",
				features: (source._data as any).features.concat(pWaveImpacted.features),
			});
		}
	}

	addEarthquakeDetectionLocations(earthquake: IEarthquakeDetection[]) {
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

			this.earthquakeDetectionMarker.set(eq.time_stamp.toString(), marker);
		});
	}
}
export default TEWSMap;
