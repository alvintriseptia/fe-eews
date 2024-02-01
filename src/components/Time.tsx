import React from "react";

class Time extends React.Component {
	state ={ 
		time: ""
	}

	interval: NodeJS.Timeout | undefined;

	componentDidMount() {
		this.interval = setInterval(() => {
			const date = new Date();
			const timezone = -(new Date().getTimezoneOffset() / 60);
			let newTime =
				date.toLocaleDateString("id-ID") + " " + date.toLocaleTimeString("id-ID");
			//add timezone WIB, WITA, OR WIT
			if (timezone === 7) {
				newTime += " WIB";
			} else if (timezone === 8) {
				newTime += " WITA";
			} else if (timezone === 9) {
				newTime += " WIT";
			}
			this.setState({ time: newTime });
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		return (
			<p className="text-5xl text-white/50 font-semibold select-none">
				{this.state.time}
			</p>
		);
	}
}

export default Time;
