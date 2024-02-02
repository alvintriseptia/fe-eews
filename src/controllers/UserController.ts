import { User } from "@/models/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";

export default class UserController {
	private user = new User();

	constructor() {
		makeObservable(this, {
			login: action,
			logout: action,
			displayError: action,
			getUser: action,
		} as AnnotationsMap<this, any>);
	}

	/**
	 * Logs in the user with the provided username and password.
	 * @param {string} username - The username of the user.
	 * @param {string} password - The password of the user.
	 */

	// ...

	async login(email: string, password: string) {
		try {
			document.querySelector("#loading_overlay").className = "block";
			// if empty string
			if (!email || !password) {
				this.displayError("Email dan password wajib diisi");
				return;
			}

			return await this.user.login(email, password);
		} catch (error) {
			// Handle login error
			this.displayError(error?.message || "Terjadi kesalahan!");
		} finally {
			document.querySelector("#loading_overlay").className = "hidden";
		}
	}

	/**
	 * Logs out the user.
	 */
	async logout() {
		await this.user.logout();
	}

	/**
	 * Displays an error message.
	 */
	displayError(message: string) {
		toast.error(message);
	}

	/**
	 * Gets the user.
	 */
	async getUser() {
		const response = await this.user.fetchUser();

		if (response.error) {
			return null;
		}

		return response.data;
	}
}
