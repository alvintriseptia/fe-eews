import { IUser } from "@/entities/_index";
import { auth } from "@/lib/firebase-config";
import {
	getAuth,
	signInWithEmailAndPassword,
	signInWithRedirect,
	signOut,
} from "firebase/auth";

export default class User implements IUser {
	email: string;
	password: string;

	async login(email: string, password: string) {
		try {
			const auth = getAuth();
			// login firebase
			const user = await signInWithEmailAndPassword(auth, email, password);

			if (user) {
				// login email password api
				const token = await user.user.getIdToken();
				if(!token) throw new Error("Terjadi kesalahan!");

				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.status === 200) {
					window.location.href = "/";
				}
			} else {
				throw new Error("Terjadi kesalahan!");
			}
		} catch (error) {
			throw error;
		}
	}

	async logout() {
		try {
			//Sign out with the Firebase client
			await signOut(auth);

			//Clear the cookies in the server
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});

			if (response.status === 200) {
				window.location.href = "/login";
			}
		} catch (error) {
			console.error("Error signing out with Google", error);
			throw error;
		}
	}

	async fetchUser() {
		// return auth.currentUser;
		try {
			const response = await fetch("/api/session");
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Error fetching user", error);
			throw error;
		}
	}
}
