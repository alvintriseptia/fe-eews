export interface IEarthquakeDetection {
    title: string;
    description: string;
    detection: string;
    station: string;
    time_stamp: number;
    depth: number;
    lat: number;
    long: number;
    mag: number;
    countdown: number;
    location?: string;
}