import React from "react";
import { observer } from "mobx-react";
import { MainController, StationController } from "@/controllers/_index";
import { IStation } from "@/entities/_index";
import EarthquakePredictionContext from "@/stores/EarthquakePredictionContext";
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
import toast from "react-hot-toast";

interface Props {
	controller: StationController;
}
const ESTIMATED_ITEM_HEIGHT = 800;

class StationView extends React.Component<Props> {
	state = {
		controller: {} as StationController,
		seismogramStations: [] as IStation[],
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
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
		// bind
		this.disableSeismogram = this.disableSeismogram.bind(this);
		this.enableSeismogram = this.enableSeismogram.bind(this);
		this.enableAllSeismogram = this.enableAllSeismogram.bind(this);
	}

	componentDidMount(): void {
		const mainController = new MainController();
		this.state.controller.connectAllSeismogram("simulation");

		observe(mainController, "earthquakePrediction", (change) => {
			if (change.newValue) {
				this.setState({
					earthquakeRealtimeInformation: {
						earthquake: change.newValue,
					},
				});
			}
		});

		observe(this.state.controller, "seismograms", (change) => {
			console.log(change.newValue);
			if (change.newValue) {
				this.setState({
					seismogramStations: STATIONS_DATA.filter((station) => {
						return change.newValue.has(station.code);
					}),
					disabledSeismogramStations: STATIONS_DATA.filter((station) => {
						return !change.newValue.has(station.code);
					}),
				});
			}
		});
	}

	componentWillUnmount(): void {}

	async disableSeismogram(station: string) {
		await this.state.controller.disableSeismogram(station);
		this.state.controller.disconnectSeismogram(station);
		this.setState({ dialogOpen: false });
	}

	async enableSeismogram(station: string) {
		await this.state.controller.enableSeismogram(station);
		this.state.controller.connectSeismogram(station, "simulation");
		this.setState({ dialogOpen: false });
	}

	async enableAllSeismogram() {
		await this.state.controller.enableAllSeismogram();
		this.state.controller.connectAllSeismogram("simulation");
		this.setState({ dialogOpen: false });
	}

	render() {
		return (
			<main>
				{/* NAVBAR */}
				<Navbar {...this.state.navbar} />

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
							onClick={() => this.setState({ tab: "enabled" })}
						>
							Stasiun Aktif
						</button>
						<button
							className={`text-white flex-1 rounded-md px-4 py-2 text-xl ${
								this.state.tab === "disabled"
									? "bg-tews-mmi-III"
									: "bg-tews-mmi-III/25"
							}`}
							onClick={() => this.setState({ tab: "disabled" })}
						>
							Stasiun Tidak Aktif
						</button>
					</div>

					<ModalDialog
						open={this.state.dialogOpen}
						title="Nonaktifkan Stasiun"
						message="Apakah anda yakin ingin menonaktifkan stasiun ini?"
						onCancel={() => this.setState({ dialogOpen: false })}
						onConfirm={() => this.disableSeismogram(this.state.selectedStation)}
					/>

					{this.state.tab === "enabled" ? (
						<EarthquakePredictionContext.Provider
							value={this.state.earthquakeRealtimeInformation?.earthquake}
						>
							{this.state.seismogramStations.map((station, index) => {
								return (
									<RenderIfVisible
										defaultHeight={ESTIMATED_ITEM_HEIGHT}
										key={index}
									>
										<div className="relative">
											{/* button disabled and title */}
											<div className="flex gap-x-4 items-center relative z-20 translate-x-20">
												<h3 className="text-white text-lg font-semibold">
													Sensor {station.code}
												</h3>
												<button
													className="bg-red-500 text-white px-4 py-2 rounded-md text-xs"
													onClick={() => {
														this.setState({
															dialogOpen: true,
															selectedStation: station.code,
														});
													}}
												>
													Nonaktifkan
												</button>
											</div>

											<DynamicLineChart
												station={station.code}
												width={"100%"}
												height={800}
												startRange={-5000}
												endRange={8000}
												showTitle={false}
											/>
										</div>
									</RenderIfVisible>
								);
							})}
						</EarthquakePredictionContext.Provider>
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
											<button
												className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-2 text-sm"
												onClick={this.enableAllSeismogram}
											>
												Aktifkan semua
											</button>
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
													className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
													onClick={() => this.enableSeismogram(station.code)}
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
