import { IEarthquakePrediction } from "@/entities/_index";

const onmessage = (event: MessageEvent) => {
	const typePrediction = ["warning", "warning", "warning"];
	const earthquakePrediction: IEarthquakePrediction = {
		title: "Terdeteksi Gelombang P",
		description: "A magnitude 5.0 earthquake is predicted to occur cuy",
		creation_date: Date.now(),
		depth: 5,
		lat: -6.1751,
		long: 106.826,
		mag: 2,
		prediction: typePrediction[Math.floor(Math.random() * 3)],
		countdown: 10,
	};
	
	postMessage(earthquakePrediction);
};

addEventListener("message", onmessage);
