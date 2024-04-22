import React from "react";
import { observer } from "mobx-react";
import { MainController, StationController } from "@/controllers/_index";
import EarthquakeDetectionContext from "@/stores/EarthquakeDetectionContext";
import { CanvasList, Navbar } from "@/components/_index";
import { EarthquakeRealtimeProps } from "@/components/EarthquakeRealtimeCard";
import { observe } from "mobx";

class StationView extends React.Component {
	state = {
		controller: {} as StationController,
		mainController: {} as MainController,
		seismogramStations: [] as string[],
		filteredSeismogramStations: [] as string[],
		disabledSeismogramStations: [] as string[],
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

		observe(this.state.controller, "enabledSeismograms", (change) => {
			if (change.newValue) {
				let newFilteredSeismogramStations = Array.from(change.newValue.keys());

				if (this.state.searchQuery !== "") {
					newFilteredSeismogramStations = newFilteredSeismogramStations.filter(
						(station) => station.toLowerCase().startsWith(this.state.searchQuery)
					);
				}

				this.setState({
					seismogramStations: Array.from(change.newValue.keys()),
					filteredSeismogramStations: newFilteredSeismogramStations,
				});
			}
		});

		observe(this.state.controller, "disabledSeismograms", (change) => {
			if (change.newValue) {
				this.setState({
					disabledSeismogramStations: Array.from(change.newValue.keys()),
				});
			}
		});

		await this.state.controller.initStations();
		await this.state.controller.connectAllSeismogram("realtime");

		this.state.mainController.connectEarthquakeDetection("realtime");
	}

	componentWillUnmount(): void {
		this.state.controller.disconnectAllSeismogram();
		this.state.mainController.disconnectEarthquakeDetection();
	}

	async disableStation(station: string) {
		await this.state.controller.disableStation(station, "realtime");
		this.setState({ dialogOpen: false });
	}

	async enableStation(station: string) {
		await this.state.controller.enableStation(station, "realtime");
		this.setState({ dialogOpen: false });
	}

	async enableAllStation() {
		await this.state.controller.enableAllStations("realtime");
		this.setState({ dialogOpen: false });
	}

	searchStation(query: string) {
		if (query === "") {
			this.setState({
				searchQuery: query,
				filteredSeismogramStations: this.state.seismogramStations,
			});
		} else {
			this.setState({
				searchQuery: query,
				filteredSeismogramStations: this.state.seismogramStations?.filter(
					(station) => station.toLowerCase().startsWith(query)
				),
			});
		}
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
				<section className="min-h-screen mt-10 overflow-x-hidden">
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
							<CanvasList
								seismograms={this.state.filteredSeismogramStations || []}
								onClickStation={this.disableStation}
								type="enabled"
							/>
						</EarthquakeDetectionContext.Provider>
					) : (
						<>
							<div className="flex justify-end items-center">
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
							<div className="relative">
								{this.state.disabledSeismogramStations.length === 0 ? (
									<div className="text-white text-center">
										Tidak ada stasiun yang dinonaktifkan
									</div>
								) : (
									<CanvasList
										seismograms={this.state.disabledSeismogramStations || []}
										onClickStation={this.enableStation}
										type="disabled"
									/>
								)}
							</div>
						</>
					)}
				</section>
			</main>
		);
	}
}

export default observer(StationView);
