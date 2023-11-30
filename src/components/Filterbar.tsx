import { FunnelIcon } from "@heroicons/react/24/outline";
import React from "react";

class Filterbar extends React.Component {
	render() {
		return (
			<section className="p-4 border-b border-b-eews-dark-slate-grey flex items-center">
				<span className="text-eews-boulder mr-1">Filter:</span>
				<select className="rounded-md bg-transparent text-white cursor-pointer">
					<option className="bg-eews-dark text-white" value="current_week">
						Minggu Ini
					</option>
					<option className="bg-eews-dark text-white" value="today">
						Hari Ini
					</option>
					<option className="bg-eews-dark text-white" value="yesterday">
						Kemarin
					</option>
					<option className="bg-eews-dark text-white" value="last_month">
						Bulan Lalu
					</option>
				</select>
				<FunnelIcon className="text-white ml-2 w-6 h-6" />
			</section>
		);
	}
}

export default Filterbar;
