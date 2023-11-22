import { INotification } from "@/entities/_index";

export default class Notification implements INotification{
    title: string;
    audio: string;
    message: string;

    playSoundEarthquakePrediction(){}

    playSoundAffectedSWave(){}
}