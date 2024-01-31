import { NextApiRequest, NextApiResponse } from "next";
import STATIONS_DATA from "@/assets/data/stations.json";
import { ResponseStationsStatus } from "@/models/response/_index";
import { IStation } from '../../entities/_index';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const { _ } = req.query;
	const url =
		"http://202.90.198.40/sismon-slmon/data/slmon.all.laststatus.json?_=" + _;

	fetch(url)
		.then((response) => response.json())
		.then((data: ResponseStationsStatus) => {
			const stationsStatus = data.features;

			const result = [] as IStation[];
			for (const item of stationsStatus) {
				const station = STATIONS_DATA.find((station) => {
					return station.code === item.properties.sta;
				}) as IStation;

				if (!station) {
					continue;
				}

				station.network = item.properties.net;
				station.ch1 = item.properties.ch1;
				station.ch2 = item.properties.ch2;
				station.ch3 = item.properties.ch3;
				station.ch4 = item.properties.ch4;
				station.ch5 = item.properties.ch5;
				station.ch6 = item.properties.ch6;
				station.timech1 = item.properties.timech1;
				station.timech2 = item.properties.timech2;
				station.timech3 = item.properties.timech3;
				station.timech4 = item.properties.timech4;
				station.timech5 = item.properties.timech5;
				station.timech6 = item.properties.timech6;
				station.latency1 = item.properties.latency1;
				station.latency2 = item.properties.latency2;
				station.latency3 = item.properties.latency3;
				station.latency4 = item.properties.latency4;
				station.latency5 = item.properties.latency5;
				station.latency6 = item.properties.latency6;
				station.color1 = item.properties.color1;
				station.color2 = item.properties.color2;
				station.color3 = item.properties.color3;
				station.color4 = item.properties.color4;
				station.color5 = item.properties.color5;
				station.color6 = item.properties.color6;

				result.push(station);
			}

            res.status(200).json(result);
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: error });
		});
}
