import { IEarthquakePrediction, IMap, IStation } from '@/entities/_index';
import { CoordinateType } from '@/types/_index';

export default class Map implements IMap{
    id: string;
    zoom: number;
    initialViewState: CoordinateType;
    mapStyle: string;

    initMap(){}

    setOnViewCenter(lat: number, long: number){
        this.initialViewState.latitude = lat;
        this.initialViewState.longitude = long;
    }

    addStations(stations: IStation[]){}

    addEarthquakePrediction(earthquake: IEarthquakePrediction){}

    clearEarthquakePrediction(){}

    simulatePWaves(){}

    simulateSWaves(){}

    addAreaAffectedPWave(){}

    addAreaAffectedSWave(){}

    addEarthquakePredictionLocations(locations: CoordinateType[]){}
}