export interface ResponseLatestEarthquake {
	identifier: string;
	sender: string;
	sent: string;
	status: string;
	msgType: string;
	scope: string;
	code: string;
	info: {
		event: string;
		date: string;
		time: string;
		point: {
			coordinates: string;
		};
		latitude: string;
		longitude: string;
		magnitude: string;
		depth: string;
		area: string;
		eventid: string;
		potential: string;
		subject: string;
		headline: string;
		description: string;
		instruction: string;
		shakemap: string;
		felt: string;
		timesent: string;
	};
};
