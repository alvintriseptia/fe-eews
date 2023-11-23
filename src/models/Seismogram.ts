import { ISeismogram } from "@/entities/_index";

export default class Seismogram implements ISeismogram{
    creation_date: number;
    z_channel: number;
    n_channel: number;
    e_channel: number;
    station: string;

    streamSeismogram(){}
    displaySeismogram(seismogram: ISeismogram[]){}
}