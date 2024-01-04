import {
	SeismogramDataType,
	SeismogramTempDataType,
} from "@/workers/seismogram";

// Struktur data yang disimpan di IndexedDB
interface SeismogramDBEntry {
	station: string;
	data: SeismogramTempDataType;
}

// Variabel database
let db: IDBDatabase | null = null;

// Fungsi untuk membuka database
function openIndexedDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		indexedDB.deleteDatabase("SeismogramDB");
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

// Fungsi untuk menulis data ke IndexedDB
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

// Fungsi untuk membaca data dari IndexedDB
function readFromIndexedDB(
	station: string
): Promise<SeismogramTempDataType | null> {
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

export { db, openIndexedDB, writeToIndexedDB, readFromIndexedDB };
