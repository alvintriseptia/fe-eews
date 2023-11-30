import { IEarthquakePrediction } from "@/entities/_index";

export default class EarthquakePrediction implements IEarthquakePrediction{
    title: string;
    description: string;
    prediction: string;
    station: string;
    creation_date: number;
    depth: number;
    lat: number;
    long: number;
    mag: number;
    countdown: number;

    constructor(earthquakePrediction?: IEarthquakePrediction){
        if(earthquakePrediction){
            this.title = earthquakePrediction.title;
            this.description = earthquakePrediction.description;
            this.prediction = earthquakePrediction.prediction;
            this.creation_date = earthquakePrediction.creation_date;
            this.depth = earthquakePrediction.depth;
            this.lat = earthquakePrediction.lat;
            this.long = earthquakePrediction.long;
            this.mag = earthquakePrediction.mag;
            this.countdown = earthquakePrediction.countdown;
            this.station = earthquakePrediction.station;
        }
    }

    fetchLatestEarthquakePrediction(){}

    async fetchHistoryEarthquakePrediction(){
        return [] as IEarthquakePrediction[];
    }

    fetchDetailEarthquakePrediction(earthquakeId: string){}
}