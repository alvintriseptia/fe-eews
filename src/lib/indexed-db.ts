import { SeismogramTempDataType } from "@/workers/seismogram";

// Variabel database
let db: IDBDatabase | null = null;

// Fungsi untuk membuka database
function createIndexedDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("SeismogramDB", 1);

		request.onerror = (event: Event) => {
			reject((event.target as IDBRequest).error);
		};

		request.onsuccess = (event: Event) => {
			const res = (event.target as IDBOpenDBRequest).result;
			db = res;
			resolve(res);

			// clean temp data
			const transaction = db.transaction(["seismogramTempData"], "readwrite");
			const store = transaction.objectStore("seismogramTempData");
			store.clear();
		};

		request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
			const db = (event.target as IDBOpenDBRequest).result;
			db.createObjectStore("seismogramTempData", { keyPath: "station" });
			db.createObjectStore("seismograms", { keyPath: "type" });
		};
	});
}

function openIndexedDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("SeismogramDB", 1);

		request.onerror = (event: Event) => {
			reject((event.target as IDBRequest).error);
		};

		request.onsuccess = (event: Event) => {
			const res = (event.target as IDBOpenDBRequest).result;
			db = res;
			resolve(res);
		};
	});
}

// Fungsi untuk menulis data ke IndexedDB
function writeToIndexedDB({ objectStore, keyPath, key, data }): Promise<any> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([objectStore], "readwrite");
		const store = transaction.objectStore(objectStore);
		const request = store.put({ [`${keyPath}`]: key, data });

		request.onerror = (event: Event) => {
			console.error(
				"Error writing to IndexedDB:",
				(event.target as IDBRequest).error
			);
			reject((event.target as IDBRequest).error);
		};

		request.onsuccess = (event: Event) => {
			resolve((event.target as IDBRequest).result);
		};
	}) as Promise<any>;
}

// Fungsi untuk membaca data dari IndexedDB
function readFromIndexedDB(
	objectStore: string,
	key: string
): Promise<any | null> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([objectStore]);
		const store = transaction.objectStore(objectStore);
		const request = store.get(key);

		request.onerror = (event: Event) => {
			console.error(
				"Error reading from IndexedDB:",
				(event.target as IDBRequest).error
			);
			reject((event.target as IDBRequest).error);
		};

		request.onsuccess = (event: Event) => {
			const result = (event.target as IDBRequest).result as any;
			if (result) {
				resolve(result.data);
			} else {
				resolve(null);
			}
		};
	});
}

export {
	db,
	createIndexedDB,
	openIndexedDB,
	writeToIndexedDB,
	readFromIndexedDB,
};
