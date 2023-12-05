import React, { Component } from "react";

export default class LoadingOverlay extends Component {
	render() {
		return (
			<section className="hidden" id="loading_overlay">
				<div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-[99999]">
					<div className="flex flex-col items-center">
						<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-4 border-sky-600"></div>
						<div className="text-white text-xl mt-4">Loading...</div>
					</div>
				</div>
			</section>
		);
	}
}
