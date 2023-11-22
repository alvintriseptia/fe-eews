import { ISeismogram } from "@/entities/_index";

export default class Seismogram implements ISeismogram{
    creation_date: string;
    z_channel: string;
    n_channel: string;
    e_channel: string;
    station: string;

    streamSeismogram(){}
    displaySeismogram(seismogram: ISeismogram[]){}
}