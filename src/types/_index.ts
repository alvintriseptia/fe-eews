export type CoordinateType = {
    latitude: number;
    longitude: number;
}
export type GeoJsonCollection = {
	type: string;
	features: any[];
};

export type RegionType = {
	id: string;
	province_id: string;
	name: string;
	alt_name: string;
	latitude: number;
	longitude: number;
	distance?: number;
	intensity?: number;
};


export type SeismogramPlotType = {
	x: number[];
	y: number[];
}
