import React from "react";

class MMIScale extends React.Component {
	mmiScales = [
		"I",
		"II",
		"III",
		"IV",
		"V",
		"VI",
		"VII",
		"VIII",
		"IX",
		"X",
	];

	mmiDestructions = ["Lemah", "Kuat", "Merusak"];

	getBackgroundColor(mmi: string) {
		switch (mmi) {
			case "I":
				return "bg-tews-mmi-I";
			case "II":
				return "bg-tews-mmi-II";
			case "III":
				return "bg-tews-mmi-III";
			case "IV":
				return "bg-tews-mmi-IV";
			case "V":
				return "bg-tews-mmi-V";
			case "VI":
				return "bg-tews-mmi-VI";
			case "VII":
				return "bg-tews-mmi-VII";
			case "VIII":
				return "bg-tews-mmi-VIII";
			case "IX":
				return "bg-tews-mmi-IX";
			case "X":
				return "bg-tews-mmi-X";
		}
	}

	render() {
		return (
			<div className="bg-white/40 rounded-lg p-2 text-white">
				<h5 className="font-semibold text-xs mb-2">Skala MMI</h5>

				<div className="flex">
					{this.mmiScales.map((scale, index) => (
						<div key={index} className="flex gap-x-1 items-center">
							<div
								className={`w-6 h-6 text-xs flex items-center justify-center 
							${scale === "I" ? "text-gray-900" : "text-white"}
							${this.getBackgroundColor(scale)}`}
							>
								{scale}
							</div>
						</div>
					))}
				</div>

				<div className="flex justify-between text-white text-xs mt-1">
					{this.mmiDestructions.map((destruction, index) => (
						<p key={index}>{destruction}</p>
					))}
				</div>
			</div>
		);
	}
}

export default MMIScale;
