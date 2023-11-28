export interface IEarthquakePrediction {
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
}