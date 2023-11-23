import { ISeismogram } from "@/entities/_index";

const onmessage = (event: MessageEvent) => {
	const seismogram: ISeismogram = {
		creation_date: new Date().getTime(),
		z_channel: Math.random() * 100,
		n_channel: Math.random() * 100,
		e_channel: Math.random() * 100,
		station: "JAGI",
	};

	postMessage(seismogram);
};

addEventListener("message", onmessage);
