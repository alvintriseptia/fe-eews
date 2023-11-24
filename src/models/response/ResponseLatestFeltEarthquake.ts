interface ResponseLatestFeltEarthquakeFeature {
	type: string;
	properties: {
		id: string;
		time: string;
		mag: string;
		place: string;
		fase: string;
		status: string;
		depth: string;
	};
	geometry: {
		type: string;
		coordinates: [string, string, number];
	};
}

export interface ResponseLatestFeltEarthquake {
	type: string;
	features: ResponseLatestFeltEarthquakeFeature[];
}