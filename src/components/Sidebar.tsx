import { IEarthquakePrediction, IExternalSource } from "@/entities/_index";
import { getIntensityColor } from "@/utils/map-style";
import { Bars4Icon } from "@heroicons/react/24/outline";
import React from "react";

export interface EarthquakeRealtimeProps {
	title: string;
	type: "prediction" | "confirmed" | "cancelled" | "";
	description: string;
	datetime: string;
	magnitude: string;
	depth: string;
	latitude: string;
	longitude: string;
	countdown: number;
}

export interface SidebarProps {
	latestFeltEarthquake: IExternalSource;
	latestEarthquake: IExternalSource;
}

class EarthquakeInfo extends React.Component<IExternalSource> {
  constructor(props: IExternalSource) {
    super(props);
    this.state = {};
  }

  render() {
    const backgroundColor = getIntensityColor(parseFloat(this.props.magnitude));

    return (
      <div className="flex flex-col gap-y-4">
        <div>
          <div className="flex justify-between gap-x-3">
            <h2 className="text-white font-semibold text-xl whitespace-pre-line">
              {this.props.title}
            </h2>

            <div className="flex flex-col items-end mt-1">
              <span className="text-xs text-white">Magnitude</span>
              <div
                className={`flex p-0.5 justify-center items-center font-semibold ${backgroundColor}`}
              >
                {Number(this.props.magnitude).toFixed(1)}
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm">{this.props.location}</p>
        </div>

        <div className="flex justify-between items-center gap-x-3 whitespace-nowrap">
          <div className="flex flex-col gap-y-3">
            <div>
              <span className="text-gray-400 text-xs mb-1">Tanggal</span>
              <h4 className="text-white text-sm">{this.props.date}</h4>
            </div>

            <div>
              <span className="text-gray-400 text-xs mb-1">Kedalaman</span>
              <h4 className="text-white text-sm">{this.props.depth}</h4>
            </div>
          </div>

          <div className="flex flex-col gap-y-3">
            <div>
              <span className="text-gray-400 text-xs mb-1">Waktu</span>
              <h4 className="text-white text-sm">{this.props.time}</h4>
            </div>

            <div>
              <span className="text-gray-400 text-xs mb-1">Latitude</span>
              <h4 className="text-white text-sm">{this.props.latitude}</h4>
            </div>
          </div>

          <div className="flex flex-col gap-y-3">
            <div>
              <span className="text-gray-400 text-xs mb-1">Stasiun</span>
              <h4 className="text-white text-sm">{this.props.station}</h4>
            </div>

            <div>
              <span className="text-gray-400 text-xs mb-1">Longitude</span>
              <h4 className="text-white text-sm">{this.props.longitude}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Sidebar extends React.Component<SidebarProps> {
    state = {
        open: true,
        latestFeltEarthquake: {} as IExternalSource,
        latestEarthquake: {} as IExternalSource,
    };

	constructor(props: SidebarProps) {
		super(props);
        this.toggleSidebar = this.toggleSidebar.bind(this);
	}

	toggleSidebar() {
		this.setState((prevState: any) => ({
            open: !prevState.open,
        }));
	}

	componentDidUpdate(prevProps: SidebarProps) {
        if (this.props.latestFeltEarthquake !== prevProps.latestFeltEarthquake) {
            this.setState({ latestFeltEarthquake: this.props.latestFeltEarthquake });
        }

        if (this.props.latestEarthquake !== prevProps.latestEarthquake) {
            this.setState({ latestEarthquake: this.props.latestEarthquake });
        }
    }

	render() {
		return (
			<>
				<button
					className={`px-3 py-2 text-base rounded-lg items-center bg-eews-dark text-white font-semibold hover:bg-eews-boulder transition-all fixed top top-3 left-2`}
					onClick={this.toggleSidebar}
				>
					<Bars4Icon className="w-6 h-6" />
				</button>

				<div
					className={`${
						this.state.open ? " w-[450px] translate-x-0" : "w-0 -translate-x-[450px]"
					} transition-all`}
				>
					<aside className="flex flex-col bg-transparent overflow-y-auto h-full">
						<div className="p-4 flex flex-col">
							<EarthquakeInfo {...this.state.latestFeltEarthquake} />

							<div className="w-full h-0.5 bg-purple-950 my-4" />

							<EarthquakeInfo {...this.state.latestEarthquake} />
						</div>

						<div className="mt-auto">
							{/* {eewsRealtime.type && (
								<EarthquakeRealtimeCard {...eewsRealtime} />
							)} */}
						</div>
					</aside>
				</div>
			</>
		);
	}
}

export default Sidebar;
