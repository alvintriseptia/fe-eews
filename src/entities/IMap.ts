import { CoordinateType } from "@/types/CoordinateType";
import { StyleSpecification } from "maplibre-gl";

export interface IMap {
    id: string;
    zoom: number;
    initialViewState: CoordinateType;
    mapStyle: string | StyleSpecification;
}