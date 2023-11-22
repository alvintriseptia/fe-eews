import { IEarthquakePrediction } from "@/entities/_index";

export default class EarthquakePrediction implements IEarthquakePrediction{
    prediction: string;
    creation_date: string;
    depth: number;
    lat: number;
    long: number;
    magnitude: number;

    streamEarthquakePrediction(){}

    fetchLatestEarthquakePrediction(){}

    fetchHistoryEarthquakePrediction(){}

    fetchDetailEarthquakePrediction(earthquakeId: string){}
}