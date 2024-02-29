import { INotification } from "@/entities/_index";

export default class Notification implements INotification {
	title: string;
	audio: string;
	message: string;
	speechDelay: number;
	sound: HTMLAudioElement;
	speech: SpeechSynthesisUtterance;

	setNotification(
		title: string,
		audio: string,
		message: string,
		speechDelay: number
	) {
		this.title = title;
		this.audio = audio;
		this.message = message;
		this.speechDelay = speechDelay;
	}

	setMessage(message: string) {
		this.message = message;
	}

	playNotification() {
		if (this.isPlayingNotification()) return;
		this.sound = new Audio(this.audio);
		this.speech = new SpeechSynthesisUtterance();
		this.sound.autoplay = true;
		if (this.message) {
			this.speech.lang = "id-ID";
			this.speech.text = this.message;
			this.speech.volume = 1;
			this.speech.rate = 1;
			this.speech.pitch = 1;
			this.sound.play();
			setTimeout(() => {
				speechSynthesis.speak(this.speech);
			}, this.speechDelay);

			// listen to the end
			this.speech.addEventListener("end", () => {
				speechSynthesis.cancel();
				this.sound = null;
			});
		}else{
			this.sound.play();
		}
	}

	private isPlayingNotification() {
		if(this.message){
			return (this.sound && !this.sound.paused) || speechSynthesis.speaking;
		}else{
			return (this.sound && !this.sound.paused);
		}
	}
}
