import { ISeismogram } from "@/entities/_index";

export default class Seismogram implements ISeismogram{
    creation_date: number;
    z_channel: number;
    n_channel: number;
    e_channel: number;
    station: string;

    constructor(station: string){
        this.station = station;
    }

    streamSeismogram(seismogramWorker: Worker, mode: string){
        seismogramWorker.postMessage({
            station: this.station,
            message: "stream",
            mode: mode,
        });
    }

    stopSeismogram(seismogramWorker: Worker){
        seismogramWorker.postMessage({
            station: this.station,
            message: "stop",
        });
    }
}