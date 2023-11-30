import { IEarthquakePrediction } from "@/entities/_index";
import { io } from "socket.io-client";

const onmessage = (event: MessageEvent) => {
	const { data } = event;

	if (data.mode === "simulation") {
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
			station: "BBJI",
		};

		postMessage(earthquakePrediction);

		// setTimeout(() => {
		// 	earthquakePrediction.lat = -7.9125;
		// 	earthquakePrediction.long = 110.5231;
		// 	earthquakePrediction.prediction = typePrediction[Math.floor(Math.random() * 3)];
		// 	earthquakePrediction.station = "UGM"

		// 	postMessage(earthquakePrediction);
		// }, 15000);
	} else {
		console.log("earthquake prediction worker")
		const socket = io("http://localhost:3333", {
			transports: ["websocket"],
		});

		socket.on("prediction-data-all", (message: any) => {
			postMessage(message);
		});
	}
};

addEventListener("message", onmessage);
