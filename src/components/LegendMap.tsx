import { InformationCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

class LegendMap extends React.Component {
	state = {
		open: false
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

		const hypocenterLegend = `
			<div class="flex items-center gap-x-2">
				<div class="font-bold text-xl text-red-500 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">
					&#x2715;
				</div>
				<p class="text-sm text-white">Hypocenter</p>
			</div>
		`;

		const legends = [pWaveLegend, sWaveLegend, hypocenterLegend];

		return (
			<section className="absolute right-4 top-12 z-30">
				<button
					className={`bg-white hover:bg-gray-300 transition-all duration-200 ease-in-out rounded-md p-1 ${this.state.open && 'bg-gray-300'}`}
					onClick={() => this.setState({ open: !this.state.open })}
				>
					<InformationCircleIcon className="w-6 h-6" />
				</button>

				{this.state.open && (
					<div className="absolute top-10 right-0 bg-eews-cinder p-2 flex flex-col gap-y-2">
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
