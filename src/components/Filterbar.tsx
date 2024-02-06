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
		const startDate = new Date(this.state.startDate);
		startDate.setHours(0, 0, 0, 0);
		const endDate = new Date(this.state.endDate);
		endDate.setHours(23, 59, 59, 999);
		this.props.onFilter(startDate.getTime(), endDate.getTime());
	}

	render() {
		return (
			<section className="p-4 border-b border-b-tews-dark-slate-grey flex items-center">
				<span className="text-tews-silver font-semibold mr-5 text-lg">Filter:</span>
				{/* start date */}
				<div className="flex items-center gap-x-2">
					<label htmlFor="start-date" className="text-tews-silver">
						Tanggal Mulai
					</label>
					<input
						type="date"
						id="start-date"
						className="border rounded-md p-1 bg-tews-dark-slate-grey text-white"
						value={new Date(this.state.startDate)
							.toISOString()
							.slice(0, 10)}
						onChange={(e) => {
							this.setState({
								startDate: new Date(e.target.value).getTime(),
							});
						}}
						max={new Date(this.state.endDate)
							.toISOString()
							.slice(0, 10)}
					/>
				</div>

				<div className="text-tews-silver font-semibold mx-2 text-lg">
					-
				</div>

				{/* end date */}
				<div className="flex items-center mr-4 gap-x-2">
					<label htmlFor="end-date" className="text-tews-silver">
						Tanggal Akhir
					</label>
					<input
						type="date"
						id="end-date"
						className="border rounded-md p-1 bg-tews-dark-slate-grey text-white"
						value={new Date(this.state.endDate)
							.toISOString()
							.slice(0, 10)}
						onChange={(e) => {
							this.setState({
								endDate: new Date(e.target.value).getTime(),
							});
						}}
						min={new Date(this.state.startDate)
							.toISOString()
							.slice(0, 10)}
						max={new Date().toISOString().slice(0, 10)}
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
