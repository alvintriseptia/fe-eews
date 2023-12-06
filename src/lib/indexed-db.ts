import { SeismogramDataType, SeismogramTempDataType } from "@/workers/seismogram";

interface SeismogramDBEntry {
	station: string;
	data: SeismogramTempDataType;
}

let db: IDBDatabase | null = null;

function openIndexedDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("SeismogramDB", 1);

		request.onerror = (event: Event) => {
			console.error("IndexedDB error:", (event.target as IDBRequest).error);
			reject((event.target as IDBRequest).error);
		};

		request.onsuccess = (event: Event) => {
			db = (event.target as IDBOpenDBRequest).result;
			resolve(db);
		};

		request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
			const db = (event.target as IDBOpenDBRequest).result;
			db.createObjectStore("seismogramTempData", { keyPath: "station" });
		};
	});
}

function writeToIndexedDB(station: string, data: SeismogramTempDataType): void {
	const transaction = db.transaction(["seismogramTempData"], "readwrite");
	const store = transaction.objectStore("seismogramTempData");
	const request = store.put({ station, data });

	request.onerror = (event: Event) => {
		console.error(
			"Error writing to IndexedDB:",
			(event.target as IDBRequest).error
		);
	};

	request.onsuccess = (event: Event) => {
		console.log("Data written to IndexedDB for station:", station);
	};
}

function readFromIndexedDB(station: string): Promise<SeismogramTempDataType | null> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(["seismogramTempData"]);
		const store = transaction.objectStore("seismogramTempData");
		const request = store.get(station);

		request.onerror = (event: Event) => {
			console.error(
				"Error reading from IndexedDB:",
				(event.target as IDBRequest).error
			);
			reject((event.target as IDBRequest).error);
		};

		request.onsuccess = (event: Event) => {
			const result = (event.target as IDBRequest).result as
				| SeismogramDBEntry
				| undefined;
			if (result) {
				resolve(result.data);
			} else {
				resolve(null);
			}
		};
	});
}

export {db, openIndexedDB, writeToIndexedDB, readFromIndexedDB}
