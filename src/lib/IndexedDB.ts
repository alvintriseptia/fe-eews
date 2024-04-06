class IndexedDB {
	private static db: IDBDatabase | null = null;

	private static createIndexedDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("SeismogramDB", 1);

			request.onerror = (event: Event) => {
				reject((event.target as IDBRequest).error);
			};

			request.onsuccess = (event: Event) => {
				const res = (event.target as IDBOpenDBRequest).result;
				IndexedDB.db = res;
				resolve(res);

				// clean temp data
				const transaction = IndexedDB.db.transaction(
					["seismogramTempData"],
					"readwrite"
				);
				const store = transaction.objectStore("seismogramTempData");
				store.clear();

				const transactionPWave = IndexedDB.db.transaction(
					["pWavesTempData"],
					"readwrite"
				);
				const storePWave = transactionPWave.objectStore("pWavesTempData");
				storePWave.clear();
			};

			request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
				const db = (event.target as IDBOpenDBRequest).result;
				db.createObjectStore("seismogramTempData", { keyPath: "station" });
				db.createObjectStore("pWavesTempData", { keyPath: "station" });
				db.createObjectStore("seismograms", { keyPath: "type" });
				db.createObjectStore("stations", { keyPath: "stations" });
			};
		});
	}

	private static async openIndexedDB(): Promise<IDBDatabase> {
		if (!IndexedDB.db) {
			await this.createIndexedDB();
		}
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("SeismogramDB", 1);

			request.onerror = (event: Event) => {
				reject((event.target as IDBRequest).error);
			};

			request.onsuccess = (event: Event) => {
				const res = (event.target as IDBOpenDBRequest).result;
				IndexedDB.db = res;
				resolve(res);
			};
		});
	}

	static async write({
		objectStore,
		keyPath,
		key,
		data,
	}): Promise<any> {
		try {
			if (!IndexedDB.db) {
				await this.openIndexedDB();
			}
			new Promise((resolve, reject) => {
				const transaction = IndexedDB.db.transaction(
					[objectStore],
					"readwrite"
				);
				const store = transaction.objectStore(objectStore);
				const request = store.put({ [`${keyPath}`]: key, data });

				request.onerror = (event: Event) => {
					console.error(
						"Error writing to IndexedDB:",
						(event.target as IDBRequest).error
					);
					reject((event.target as IDBRequest).error);
				};

				request.onsuccess = (event_1: Event) => {
					console.log("Data written to IndexedDB")
					resolve((event_1.target as IDBRequest).result);
				};
			}) as Promise<any>;
		} catch (error) {
			throw new Error(error);
		}
	}

	static async read(
		objectStore: string,
		key: string
	): Promise<any | null> {
		try {
			if (!IndexedDB.db) {
				await this.openIndexedDB();
			}
			return new Promise((resolve, reject) => {
				const transaction = IndexedDB.db.transaction([objectStore]);
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
		} catch (error) {
			throw new Error(error);
		}
	}
}

export default IndexedDB;
