import Station from "./Station"

class RootStore {
    stationModel: Station

    static type = {
        STATION_MODEL: 'stationModel'
    }

    constructor() {
        this.stationModel = new Station()
    }

    getStores = () => ({
        [RootStore.type.STATION_MODEL]: this.stationModel
    })
}

export default RootStore