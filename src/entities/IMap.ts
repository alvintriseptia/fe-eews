import { CoordinateType } from "@/types/CoordinateType";

export interface IMap {
    id: string;
    zoom: number;
    initialViewState: CoordinateType;
    mapStyle: string;
}