import React from "react";
import { observer } from "mobx-react";
import { PredictionController } from "@/controllers/_index";
import { IEarthquakePrediction, IMap, ISeismogram } from "@/entities/_index";
import {
	Filterbar,
	Navbar,
	PredictionCard,
	PredictionRecapContent,
} from "@/components/_index";
import { PredictionCardProps } from "@/components/PredictionCard";
import sampleWaves from "@/assets/data/sampleWaves.json";

interface Props {
	controller: PredictionController;
}

const predictions: PredictionCardProps[] = [
	{
		time: "28/07/2023 \n 02:50 WIB",
		location: "Banda Aceh",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "01/09/2023 \n 02:50 WIB",
		location: "Bengkulu",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "10/09/2023 \n 02:50 WIB",
		location: "Solok",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "28/07/2023 \n 02:50 WIB",
		location: "Banda Aceh",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "01/09/2023 \n 02:50 WIB",
		location: "Bengkulu",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "10/09/2023 \n 02:50 WIB",
		location: "Solok",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "28/07/2023 \n 02:50 WIB",
		location: "Banda Aceh",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "01/09/2023 \n 02:50 WIB",
		location: "Bengkulu",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "10/09/2023 \n 02:50 WIB",
		location: "Solok",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "28/07/2023 \n 02:50 WIB",
		location: "Banda Aceh",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "01/09/2023 \n 02:50 WIB",
		location: "Bengkulu",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "10/09/2023 \n 02:50 WIB",
		location: "Solok",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "28/07/2023 \n 02:50 WIB",
		location: "Banda Aceh",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "01/09/2023 \n 02:50 WIB",
		location: "Bengkulu",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "10/09/2023 \n 02:50 WIB",
		location: "Solok",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "28/07/2023 \n 02:50 WIB",
		location: "Banda Aceh",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "01/09/2023 \n 02:50 WIB",
		location: "Bengkulu",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "10/09/2023 \n 02:50 WIB",
		location: "Solok",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "28/07/2023 \n 02:50 WIB",
		location: "Banda Aceh",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "01/09/2023 \n 02:50 WIB",
		location: "Bengkulu",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
	{
		time: "10/09/2023 \n 02:50 WIB",
		location: "Solok",
		latitude: 5.55,
		longitude: 95.32,
		depth: 10,
		magnitude: 4.5,
	},
];

const recapPrediction = {
	magnitude: 4.5,
	depth: 10,
	latitude: 5.55,
	longitude: 95.32,
	location: "Banda Aceh",
	timestamp: "28/07/2023 \n 02:50 WIB",
	station: "JAGI",
	waves: sampleWaves,
};

class PredictionView extends React.Component<Props> {
	state = {
		controller: {} as PredictionController,
		earthquakePrediction: {} as IEarthquakePrediction,
		map: {} as IMap,
		seismogram: {} as ISeismogram,
		navbar: {
			isLoggedIn: true,
			navLinks: [],
			totalEarthquakes: null,
			maximumMagnitude: null,
			minimumMagnitude: null,
			headerInfos: [],
			btnAuth: null,
		},
		// recapPrediction: {} as PredictionRecapContentProps,
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
	}

	componentDidMount(): void {
		this.state.controller.getHistoryEarthquakePrediction();
	}

	download() {}
	render() {
		return (
			<main className="h-screen flex flex-col overflow-hidden">
				<Navbar {...this.state.navbar} />
				<Filterbar />

				<section className="h-full grid grid-cols-12">
					<div className="h-full overflow-y-auto overflow-x-hidden col-span-5">
						<div className="flex flex-col p-4">
							<div className="flex justify-between">
								{/* <PredictionSummary {...predictionSummaryEntity} /> */}

								{/* <MagnitudeSummary /> */}
							</div>

							{predictions.map((prediction, index) => (
								<PredictionCard {...prediction} key={index} />
							))}
						</div>
					</div>

					<div className="col-span-7">
						<div id="eews-history-map" className="w-full h-[48%]"></div>
						<div className="w-full">
							<PredictionRecapContent {...recapPrediction} />
						</div>
					</div>
				</section>
			</main>
		);
	}
}

export default observer(PredictionView);
