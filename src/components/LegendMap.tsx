import { InformationCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

class LegendMap extends React.Component {
	state = {
		open: false,
	};

	render() {
		const pWaveLegend = `
			<div class="flex items-center gap-x-2">
				<div class="w-6 h-6 rounded-full border border-[#0000ff]"></div>
				<p class="text-sm text-white">P-Wave</p>
			</div>
		`;

		const sWaveLegend = `
			<div class="flex items-center gap-x-2">
				<div class="w-6 h-6 rounded-full border border-[#ff0000]"></div>
				<p class="text-sm text-white">S-Wave</p>
			</div>
		`;

		const epicenterLegend = `
			<div class="flex items-center gap-x-2">
				<div class="font-bold text-xl text-red-500 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">
					&#x2715;
				</div>
				<p class="text-sm text-white">Epicenter</p>
			</div>
		`;

		const stationNetworks = {
			green: "<10s",
			yellow: "<1m",
			orange: "<3m",
			red: "<30m",
			grey: "<1d",
			black: ">1d",
		};

		let stationNetworksLegend = `<div class="text-white"> Latency </div>`;
		for (const [key, value] of Object.entries(stationNetworks)) {
			stationNetworksLegend += `
			<div class="flex items-center gap-x-2">
				<div class="station-marker" style="${key == "black" ? "border-bottom: 16px solid #333" : `border-bottom: 16px solid ${key}`}"></div>
				<div class="station-marker__code text-white text-sm text-center">${value}</div>
			</div>
			`;
		}

		const legends = [pWaveLegend, sWaveLegend, epicenterLegend, stationNetworksLegend];

		return (
			<section className="absolute right-4 top-12 z-30">
				<button
					className={`bg-white hover:bg-gray-300 transition-all duration-200 ease-in-out rounded-md p-1 ${
						this.state.open && "bg-gray-300"
					}`}
					onClick={() => this.setState({ open: !this.state.open })}
				>
					<InformationCircleIcon className="w-6 h-6" />
				</button>

				{this.state.open && (
					<div className="absolute top-10 right-4 bg-tews-cinder p-2 flex flex-col gap-y-2 w-40 overflow-x-hidden">
						{legends.map((legend, index) => (
							<div key={index} dangerouslySetInnerHTML={{ __html: legend }} />
						))}
					</div>
				)}
			</section>
		);
	}
}

export default LegendMap;
