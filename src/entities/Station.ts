
/**
 * Represents a station in the system.
 */
export interface IStation {
	/**
	 * The code of the station.
	 */
	code: string;

	/**
	 * The network to which the station belongs.
	 */
	network: string;

	/**
	 * The latitude coordinate of the station.
	 */
	latitude: number;

	/**
	 * The longitude coordinate of the station.
	 */
	longitude: number;

	/**
	 * The creation date of the station.
	 */
	creation_date: string;

	/**
	 * The elevation of the station.
	 */
	elevation: number;

	/**
	 * The description of the station.
	 */
	description: string;
}