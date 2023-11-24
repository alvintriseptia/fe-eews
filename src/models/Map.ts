import { IEarthquakePrediction, IMap, IStation } from "@/entities/_index";
import { CoordinateType } from "@/types/_index";
import MapLibreGL, { StyleSpecification } from "maplibre-gl";
import { Map as MapLibre } from "maplibre-gl";
import BallMarker from "@/assets/images/ball-marker.ico";

export default class Map implements IMap {
	id: string;
	zoom: number;
	initialViewState: CoordinateType;
	mapStyle: string | StyleSpecification;
	map: MapLibre;

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
                    })
                        .setHTML(`<div>
									<h3>${station.description}</h3>
									<div>Didirikan: ${new Date(station.creation_date).toLocaleString()}</div>
								</div>
						`)
                );
		});
	}

	addEarthquakePrediction(earthquake: IEarthquakePrediction) {}

	clearEarthquakePrediction() {}

	simulatePWaves() {}

	simulateSWaves() {}

	addAreaAffectedPWave() {}

	addAreaAffectedSWave() {}

	addEarthquakePredictionLocations(locations: CoordinateType[]) {}
}
