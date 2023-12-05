import { CoordinateType } from "@/types/_index";
import { StyleSpecification } from "maplibre-gl";

export interface IMap {
    id: string;
    zoom: number;
    initialViewState: CoordinateType;
    mapStyle: string | StyleSpecification;
}