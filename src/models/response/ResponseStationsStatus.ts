interface ResponseStationsStatusFeature {
	geometry: {
		type: "Point";
		coordinates: [string, string, number];
	};
	type: "Feature";
	properties: {
		ipaddr: string;
		net: string;
		sta: string;
		locid: string;
		time: string;
		ch1: string;
		ch2: string;
		ch3: string;
		ch4: string;
		ch5: string;
		ch6: string;
		timech1: string;
		timech2: string;
		timech3: string;
		timech4: string;
		timech5: string;
		timech6: string;
		location: string;
		provin: string;
		country: string;
		merkdgtz: string;
		merkbb: string;
		merkac: string;
		uptbmkg: string;
		latency1: string;
		latency2: string;
		latency3: string;
		latency4: string;
		latency5: string;
		latency6: string;
		color1: string;
		color2: string;
		color3: string;
		color4: string;
		color5: string;
		color6: string;
	};
}

export interface ResponseStationsStatus {
	type: string;
	features: ResponseStationsStatusFeature[];
}
