import { FunnelIcon } from "@heroicons/react/24/outline";
import React from "react";

interface FilterbarProps {
	onFilter: (filter: string) => void;
}

class Filterbar extends React.Component<FilterbarProps> {
	state = {
		currentFilter: "current_week",
	};


	handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if(!this.props.onFilter) return;
		if(e.target.value === this.state.currentFilter) return;

		this.setState({ currentFilter: e.target.value });
		this.props.onFilter(e.target.value);
	};

	render() {
		return (
			<section className="p-4 border-b border-b-tews-dark-slate-grey flex items-center">
				<span className="text-tews-boulder mr-1">Filter:</span>
				<select
					className="rounded-md bg-transparent text-white cursor-pointer"
					onChange={this.handleFilter}
				>
					<option className="bg-tews-dark text-white" value="current_week">
						Minggu Ini
					</option>
					<option className="bg-tews-dark text-white" value="current_month">
						Bulan Ini
					</option>
					<option className="bg-tews-dark text-white" value="last_month">
						Bulan Lalu
					</option>
					<option className="bg-tews-dark text-white" value="this_year">
						Tahun ini
					</option>
				</select>
				<FunnelIcon className="text-white ml-2 w-6 h-6" />
			</section>
		);
	}
}

export default Filterbar;
