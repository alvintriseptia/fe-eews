export interface IEarthquakePrediction {
    title: string;
    description: string;
    prediction: string;
    station: string;
    time_stamp: number;
    depth: number;
    lat: number;
    long: number;
    mag: number;
    countdown: number;
    location?: string;
}