"use client";
import { IEarthquakePrediction } from "@/entities/IEarthquakePrediction";
import STATIONS_DATA from "@/assets/data/stations.json";
import { IStation } from "@/entities/IStation";
import EarthquakePredictionContext from "@/stores/EarthquakePredictionContext";
import MMIScale from "@/components/MMIScale";
import Time from "@/components/Time";
import EarthquakeRealtimeCard, {
	EarthquakeRealtimeProps,
} from "@/components/EarthquakeRealtimeCard";
import EarthquakeHistorySidebar from "@/components/EarthquakeHistorySidebar";
import Sidebar from "@/components/Sidebar";
import LegendMap from "@/components/LegendMap";
import Navbar from "@/components/Navbar";
import Seismogram from "@/components/Seismogram";
import MainController from "@/controllers/MainController";
import SimulationController from "@/controllers/SimulationController";
import StationController from "@/controllers/StationController";
import { IMap } from "@/entities/IMap";
import { INotification } from "@/entities/INotification";
import { ISeismogram } from "@/entities/ISeismogram";
import { IExternalSource } from "@/entities/IExternalSource";
import React from "react";
import SeismogramContext from "@/stores/SeismogramContext";

const state = {
	controller: {} as MainController | SimulationController,
	stationController: {} as StationController,
	earthquakePrediction: {} as EarthquakeRealtimeProps,
	map: {} as IMap,
	notification: {} as INotification,
	seismogram: [] as ISeismogram[],
	last5MEartquake: {} as IExternalSource,
	lastFeltEarthquake: {} as IExternalSource,
	weeklyEarthquake: [] as IExternalSource[],
	navbar: {
		isLoggedIn: false,
		navLinks: [],
		totalEarthquakes: 0,
		maximumMagnitude: 0,
		minimumMagnitude: 100,
		headerInfos: [],
	},
	sidebarProps: {
		latestFeltEarthquake: {} as IExternalSource,
		latestEarthquake: {} as IExternalSource,
		latestPrediction: {} as IEarthquakePrediction,
	},
	earthquakeRealtimeInformation: {} as EarthquakeRealtimeProps,
	countdown: 0,
	stations: STATIONS_DATA as IStation[],
};

function performance(): JSX.Element {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [seismogramWorker, setSeismogramWorker] = React.useState<Worker>(null);
	// eslint-disable-next-line react-hooks/rules-of-hooks
	React.useEffect(() => {
		const seismogramWorker = new Worker(
			new URL("../workers/seismogram.ts", import.meta.url)
		);
        setSeismogramWorker(seismogramWorker);

		state.stationController = new StationController(seismogramWorker);

		state.stationController.connectSeismogram("simulation");
	}, []);

    if(!seismogramWorker) return (<></>)
	return (
		<main className="h-screen flex flex-col overflow-hidden">
			{/* NAVBAR */}
			<Navbar {...state.navbar} />

			{/* CONTENT */}
			<section className="flex h-full relative overflow-hidden">
				<Sidebar {...state.sidebarProps} />

				<EarthquakeHistorySidebar weeklyEarthquake={state.weeklyEarthquake} />

				<LegendMap />

				<div className="flex flex-col w-full">
					<div className="relative h-full">
						<div className="w-full h-full" id="tews-map"></div>

						<section className="absolute bottom-3 left-2 z-20">
							{state.earthquakeRealtimeInformation &&
								state.earthquakeRealtimeInformation.earthquake?.time_stamp && (
									<EarthquakeRealtimeCard
										{...state.earthquakeRealtimeInformation}
									/>
								)}
						</section>

						<section className="absolute bottom-4 left-0 right-4 z-20 text-right">
							<Time />
						</section>

						<section className="absolute bottom-20 right-4 z-20 text-right">
							<MMIScale />
						</section>
					</div>

					<SeismogramContext.Provider value={seismogramWorker}>
						<EarthquakePredictionContext.Provider
							value={state.earthquakeRealtimeInformation?.earthquake}
						>
							<Seismogram
								seismogramStations={state.stations.map((s) => s.code)}
							/>
						</EarthquakePredictionContext.Provider>
					</SeismogramContext.Provider>
				</div>
			</section>
		</main>
	);
}

export default performance;
