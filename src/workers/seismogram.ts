import STATIONS_DATA from '@/assets/data/stations.json';
import { ISeismogram } from '@/entities/ISeismogram';

const onmessage = (event: MessageEvent) => {
    const stations = STATIONS_DATA;
    const { station, message, creation_date } = event.data;

    const stationData = stations.find((s) => s.code === station);

    if (stationData && message === "stream") {
        streamStationSeismogram(stationData.code);
    }else if(stationData && message === "earthquake"){
        postMessage({
            station,
            creation_date
        });
    } else if (stationData && message === "stop") {
        stopStationSeismogram(stationData.code);
    }
};

function streamStationSeismogram(station: string) {
    setInterval(() => {
        // TODO: the real code using websocket
        let time = new Date().getTime() - 1000;
        const seismogram: ISeismogram[] = new Array(200).fill(0).map(() => {
            time += 100;
            return {
                creation_date: time,
                z_channel: Math.random() * 6000 + 500,
                n_channel: Math.random() * 4000 + 200,
                e_channel: Math.random() * 2000 + 400,
                station: station,
            };
        });

        postMessage({
            station,
            seismogram,
        });
    }, 20000);
}

function stopStationSeismogram(station: string) {
    
}

addEventListener("message", onmessage);
