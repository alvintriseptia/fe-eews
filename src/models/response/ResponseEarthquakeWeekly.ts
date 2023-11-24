interface ResponseEarthquakeWeeklyFeature {
	geometry: {
		type: "Point";
		coordinates: [string, string, number];
	};
	type: "Feature";
	properties: {
		index: number;
		status: string;
		depth: string;
		place: string;
		mag: string;
		time: string;
		id: string;
		fase: string;
	};
}

export interface ResponseEarthquakeWeekly {
    type: string;
    features: ResponseEarthquakeWeeklyFeature[];
}
