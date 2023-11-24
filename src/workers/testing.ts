import { ISeismogram } from "@/entities/_index";

const onmessage = (event: MessageEvent) => {
	const seismogram: ISeismogram = {
		creation_date: new Date().getTime(),
		z_channel: Math.random() * 100,
		n_channel: Math.random() * 100,
		e_channel: Math.random() * 100,
		station: "JAGI",
	};

	const request = indexedDB.open("seismograms");
	request.onsuccess = (event: any) => {
		const db = event.target.result;
		const transaction = db.transaction(["seismograms"], "readwrite");
		// create an object store on the transaction
		const objectStore = transaction.objectStore("seismograms");
		const addRequest = objectStore.add(JSON.stringify(seismogram));
		addRequest.onsuccess = () => {
			console.log("Seismogram added to the store");
		};
		addRequest.onerror = () => {
			console.log("Error", addRequest.error);
		};
	};

	postMessage(seismogram);
};

addEventListener("message", onmessage);
