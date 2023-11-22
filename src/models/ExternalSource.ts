import { IExternalSource } from "@/entities/_index";

export default class ExternalSource implements IExternalSource{
    id: string;
    mag: string;
    place: string;
    long: number;
    lat: number;

    fetchEarthquakeWeekly(){}
    fetchLatestM5Earthquake(){}
    fetchLatestFeltEarthquake(){}
}   