import { FunnelIcon } from "@heroicons/react/24/outline";
import React from "react";

interface FilterbarProps {
	onFilter: (startDate: number, endDate: number) => void;
}

class Filterbar extends React.Component<FilterbarProps> {
	state = {
		startDate: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
		endDate: new Date().getTime(),
	};

	handleFilter() {
		this.props.onFilter(this.state.startDate, this.state.endDate);
	}

	render() {
		return (
			<section className="p-4 border-b border-b-tews-dark-slate-grey flex items-end">
				<span className="text-tews-silver font-semibold mr-5 text-lg self-start">Filter:</span>
				{/* start date */}
				<div className="flex flex-col mr-4">
					<label htmlFor="start-date" className="text-tews-silver">
						Tanggal Mulai
					</label>
					<input
						type="date"
						id="start-date"
						className="border border-tews-dark-slate-grey rounded-md p-1"
						value={new Date(this.state.startDate)
							.toISOString()
							.slice(0, 10)}
						onChange={(e) => {
							this.setState({
								startDate: new Date(e.target.value).getTime(),
							});
						}}
					/>
				</div>

				{/* end date */}
				<div className="flex flex-col mr-4">
					<label htmlFor="end-date" className="text-tews-silver">
						Tanggal Selesai
					</label>
					<input
						type="date"
						id="end-date"
						className="border border-tews-dark-slate-grey rounded-md p-1"
						value={new Date(this.state.endDate)
							.toISOString()
							.slice(0, 10)}
						onChange={(e) => {
							this.setState({
								endDate: new Date(e.target.value).getTime(),
							});
						}}
					/>
				</div>

				{/* filter button */}
				<button
					className="text-white flex justify-center items-center bg-tews-dark-slate-grey hover:bg-tews-dark-slate-grey/70 transition-all duration-200 ease-in-out px-3 py-2 rounded-md font-semibold"
					onClick={() => this.handleFilter()}
				>
					<FunnelIcon className="w-5 h-5 mr-2 font-bold" />
					Terapkan
				</button>
			</section>
		);
	}
}

export default Filterbar;
