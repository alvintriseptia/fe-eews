import React from "react";
import { observer } from "mobx-react";
import { MainController, StationController } from "@/controllers/_index";
import { IStation } from "@/entities/_index";
import EarthquakeDetectionContext from "@/stores/EarthquakeDetectionContext";
import {
	DynamicLineChart,
	ModalDialog,
	Navbar,
	Seismogram,
} from "@/components/_index";
import { EarthquakeRealtimeProps } from "@/components/EarthquakeRealtimeCard";
import RenderIfVisible from "react-render-if-visible";
import { observe } from "mobx";
import STATIONS_DATA from "@/assets/data/stations.json";

const ESTIMATED_ITEM_HEIGHT = 400;

class StationView extends React.Component {
	state = {
		controller: {} as StationController,
		mainController: {} as MainController,
		seismogramStations: [] as IStation[],
		filteredSeismogramStations: [] as IStation[],
		disabledSeismogramStations: [] as IStation[],
		earthquakeRealtimeInformation: {} as EarthquakeRealtimeProps,
		navbar: {
			isLoggedIn: false,
			navLinks: [],
			totalEarthquakes: null,
			maximumMagnitude: null,
			minimumMagnitude: null,
			headerInfos: [],
		},
		tab: "enabled",
		dialogOpen: false,
		selectedStation: "",
		searchQuery: "",
	};
	constructor(props) {
		super(props);
		// bind
		this.disableStation = this.disableStation.bind(this);
		this.enableStation = this.enableStation.bind(this);
		this.enableAllStation = this.enableAllStation.bind(this);

		this.state.controller = StationController.getInstance();
		this.state.mainController = new MainController();
	}

	async componentDidMount() {
		observe(this.state.mainController, "rerender", (change) => {
			if (change.newValue) {
				this.setState({
					earthquakeRealtimeInformation: {
						earthquake: this.state.mainController.earthquakeDetection,
					},
				});
			}
		});

		observe(this.state.controller, "seismograms", (change) => {
			if (change.newValue) {
				let newFilteredSeismogramStations = STATIONS_DATA.filter((station) => {
					return change.newValue.has(station.code);
				});

				if (this.state.searchQuery !== "") {
					newFilteredSeismogramStations = newFilteredSeismogramStations.filter(
						(station) => {
							return station.code
								.toLowerCase()
								.includes(this.state.searchQuery.toLowerCase());
						}
					);
				}

				this.setState({
					seismogramStations: STATIONS_DATA.filter((station) => {
						return change.newValue.has(station.code);
					}),
					filteredSeismogramStations: newFilteredSeismogramStations,
					disabledSeismogramStations: STATIONS_DATA.filter((station) => {
						return !change.newValue.has(station.code);
					}),
				});
			}
		});

		await this.state.controller.initStations();
		await this.state.controller.connectAllSeismogram("realtime");

		this.state.mainController.connectEarthquakeDetection();
	}

	componentWillUnmount(): void {
		this.state.controller.disconnectAllSeismogram();
		this.state.mainController.disconnectEarthquakeDetection();
	}

	async disableStation(station: string) {
		await this.state.controller.disableStation(station);
		this.state.controller.disconnectSeismogram(station);
		this.setState({ dialogOpen: false });
	}

	async enableStation(station: string) {
		await this.state.controller.enableStation(station);
		this.state.controller.connectSeismogram(station, "realtime");
		this.setState({ dialogOpen: false });
	}

	async enableAllStation() {
		await this.state.controller.enableAllStations();
		this.state.controller.connectAllSeismogram("realtime");
		this.setState({ dialogOpen: false });
	}

	searchStation(query: string) {
		this.setState({
			searchQuery: query,
			filteredSeismogramStations: this.state.seismogramStations.filter(
				(station) => {
					return station.code.toLowerCase().includes(query.toLowerCase());
				}
			),
		});
	}

	setSection(section: string) {
		this.setState({ tab: section });
	}

	render() {
		return (
			<main>
				{/* NAVBAR */}
				<Navbar {...this.state.navbar} />

				{/* <ModalDialog
					open={this.state.dialogOpen}
					title="Nonaktifkan Stasiun"
					message={`Apakah anda yakin ingin menonaktifkan stasiun ${this.state.selectedStation}?`}
					onCancel={() => this.setState({ dialogOpen: false })}
					onConfirm={() => this.disableStation(this.state.selectedStation)}
				/> */}

				{/* CONTENT */}
				<section className="h-full mt-10 overflow-x-hidden">
					{/* Tabbar Enabled & Disabled Stations */}
					<div className="flex mb-20">
						<button
							className={`text-white flex-1 rounded-md px-4 py-2 text-xl ${
								this.state.tab === "enabled"
									? "bg-tews-mmi-III"
									: "bg-tews-mmi-III/25"
							}`}
							onClick={() => this.setSection("enabled")}
						>
							Stasiun Aktif
						</button>
						<button
							className={`text-white flex-1 rounded-md px-4 py-2 text-xl ${
								this.state.tab === "disabled"
									? "bg-tews-mmi-III"
									: "bg-tews-mmi-III/25"
							}`}
							onClick={() => this.setSection("disabled")}
						>
							Stasiun Tidak Aktif
						</button>
					</div>

					{this.state.tab === "enabled" ? (
						<EarthquakeDetectionContext.Provider
							value={this.state.earthquakeRealtimeInformation?.earthquake}
						>
							<div className="flex items-center justify-center mb-16">
								<input
									type="text"
									className="border border-gray-300 rounded-md px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-tews-mmi-III/50"
									placeholder="Cari stasiun"
									value={this.state.searchQuery}
									onChange={(e) => this.searchStation(e.target.value)}
								/>
							</div>

							<div className="flex flex-wrap justify-center">
								{this.state.filteredSeismogramStations.map((station, index) => {
									return (
										<div key={index}>
											<RenderIfVisible defaultHeight={ESTIMATED_ITEM_HEIGHT}>
												<div className="relative">
													{/* button disabled and title */}
													<div className="flex gap-x-4 items-center relative z-20 translate-x-20">
														<h3 className="text-white text-lg font-semibold">
															Sensor {station.code}
														</h3>
														<button
															className="bg-tews-mmi-X text-white px-4 py-2 rounded-md text-xs"
															onClick={() => this.disableStation(station.code)}
														>
															Nonaktifkan
														</button>
													</div>

													<DynamicLineChart
														station={station.code}
														width={600}
														height={350}
														showTitle={false}
													/>
												</div>
											</RenderIfVisible>
										</div>
									);
								})}
							</div>
						</EarthquakeDetectionContext.Provider>
					) : (
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-tews-mmi-VIII text-white">
									<th className="border p-2">Kode Stasiun</th>
									<th className="border p-2">Network Stasiun</th>
									<th className="border p-2">Deskripsi</th>
									<th className="border p-2">
										<div className="flex justify-center items-center">
											<span>Aksi</span>
											{this.state.disabledSeismogramStations.length > 0 && (
												<button
													className="bg-tews-blue text-white font-bold py-1 px-2 rounded ml-2 text-sm"
													onClick={this.enableAllStation}
												>
													Aktifkan semua
												</button>
											)}
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{this.state.disabledSeismogramStations.length === 0 ? (
									<tr className="border border-blue-50/60 text-white">
										<td colSpan={4} className="text-center">
											Tidak ada stasiun yang dinonaktifkan
										</td>
									</tr>
								) : (
									this.state.disabledSeismogramStations.map((station) => (
										<tr
											key={station.code}
											className="border border-blue-50/60 text-white"
										>
											<td className="border p-2">{station.code}</td>
											<td className="border p-2">{station.network}</td>
											<td className="border p-2">{station.description}</td>
											<td className="border p-2">
												<button
													className="bg-tews-blue text-white font-bold py-2 px-4 rounded"
													onClick={() => this.enableStation(station.code)}
												>
													Aktifkan
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					)}
				</section>
			</main>
		);
	}
}

export default observer(StationView);
