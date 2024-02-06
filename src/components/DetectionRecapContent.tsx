import dynamic from "next/dynamic";
import { Layout } from "plotly.js";
import React, { Component } from "react";

const Plot = dynamic(
  () => import("react-plotly.js").then((mod) => mod.default),
  {
    ssr: false,
  }
);

export type WaveChannel = {
  x: number[];
  y: number[];
  name: string;
};

export interface DetectionRecapContentProps {
	magnitude: number;
	depth: number;
	latitude: number;
	longitude: number;
	location: string;
	time_stamp: number;
	station: string;
	z_channel: WaveChannel;
	n_channel: WaveChannel;
	e_channel: WaveChannel;
	pwaves: WaveChannel[];
}

class DetectionRecapContent extends Component<DetectionRecapContentProps> {
	state = {
		z_channel: {} as WaveChannel,
		n_channel: {} as WaveChannel,
		e_channel: {} as WaveChannel,
		pwaves: [] as WaveChannel[],
		revision: 0,
		layout:{
			datarevision: 0,
			xaxis: {
				type: "date",
				color: "#fff",
				range: [this.props.z_channel.x[0], this.props.z_channel.x[this.props.z_channel.x.length - 1]],
			},
			yaxis: {
				type: "linear",
				color: "#fff",
				// range: [-1500, 3000],
				fixedrange: true,
			},
			yaxis2: {
				type: "linear",
				color: "#fff",
				// range: [-1500, 3000],
				fixedrange: true,
			},
			yaxis3: {
				type: "linear",
				color: "#fff",
				// range: [-1500, 3000],
				fixedrange: true,
			},
			yaxis4: {
				type: "linear",
				color: "#fff",
				// range: [-1500, 3000],
				fixedrange: true,
				overlaying: "y",
			},
			yaxis5: {
				type: "linear",
				color: "#fff",
				// range: [-1500, 3000],
				fixedrange: true,
				overlaying: "y2",
			},
			yaxis6: {
				type: "linear",
				color: "#fff",
				// range: [-1500, 3000],
				fixedrange: true,
				overlaying: "y3",
			},
			height: 500,
			width: 1000,
			paper_bgcolor: "#0D121C",
			plot_bgcolor: "transparent",
			grid: {
				rows: 3,
				columns: 1,
				subplots: ["xy", "xy2", "xy3"],
				roworder: "top to bottom",
				xgap: 0.05,
				ygap: 20,
				xside: "bottom plot",
				yside: "left plot",
			},
			showlegend: false,
		} as Partial<Layout>
	};

	constructor(props: DetectionRecapContentProps) {
		super(props);
		this.state.z_channel = props.z_channel;
		this.state.n_channel = props.n_channel;
		this.state.e_channel = props.e_channel;
		this.state.pwaves = props.pwaves;
	}

	componentDidUpdate(prevProps: DetectionRecapContentProps) {
		if (prevProps !== this.props) {
			const { layout } = this.state;
			this.setState({
				z_channel: this.props.z_channel,
				n_channel: this.props.n_channel,
				e_channel: this.props.e_channel,
				pwaves: this.props.pwaves,
				revision: this.state.revision + 1,
			});
			layout.datarevision = this.state.revision + 1;
			layout.xaxis = {
				type: "date",
				color: "#fff",
				range: [this.props.z_channel.x[0], this.props.z_channel.x[this.props.z_channel.x.length - 1]],
			};
		}
	}

  render() {
    let date = new Date(this.props.time_stamp);
    const time =
      date.toLocaleDateString("id-ID") + " " + date.toLocaleTimeString("id-ID");

    return (
      <section className="flex flex-col p-4 border-b">
        <div className="flex justify-between mb-4 relative z-10">
          <div>
            <h6 className="text-tews-boulder text-xs">Lokasi</h6>
            <p className="text-white max-width-[200px]">
              {this.props.location}
            </p>
          </div>

          <div>
            <h6 className="text-tews-boulder text-xs">Waktu</h6>
            <p className="text-white">{time}</p>
          </div>

          <div>
            <h6 className="text-tews-boulder text-xs">Magnitude</h6>
            <p className="text-white">
              {this.props.magnitude?.toFixed(2) || ""}
            </p>
          </div>

          <div>
            <h6 className="text-tews-boulder text-xs">Kedalaman</h6>
            <p className="text-white">{this.props.depth?.toFixed(2) || ""}Km</p>
          </div>

          <div>
            <h6 className="text-tews-boulder text-xs">Latitude</h6>
            <p className="text-white">
              {this.props.latitude?.toFixed(2) || ""}
            </p>
          </div>

          <div>
            <h6 className="text-tews-boulder text-xs">Longitude</h6>
            <p className="text-white">
              {this.props.longitude?.toFixed(2) || ""}
            </p>
          </div>
          <div>
            <h6 className="text-tews-boulder text-xs">Stasiun</h6>
            <p className="text-white">{this.props.station}</p>
          </div>
        </div>

        <div className="w-full relative -top-24 right-0">
          <Plot
            data={[
              this.state.z_channel,
              this.state.n_channel,
              this.state.e_channel,
              ...this.state.pwaves,
            ]}
            layout={this.state.layout}
            style={{ width: "100%", height: "100%" }}
            revision={this.state.revision}
            config={{
              displayModeBar: false,
            }}
          />
        </div>
      </section>
    );
  }
}

export default DetectionRecapContent;
