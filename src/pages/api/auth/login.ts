import { auth } from "firebase-admin";
import { customInitApp } from "@/lib/firebase-admin-config";
import { getCookie, setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

// Init the Firebase SDK every time the server is called
customInitApp();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return NextResponse.next();
	}

	const authorization = req.headers["authorization"];
	if (authorization?.startsWith("Bearer ")) {
		const idToken = authorization.split("Bearer ")[1];
		const decodedToken = await auth().verifyIdToken(idToken);
		if (decodedToken) {
			//Generate session cookie
			const expiresIn = 60 * 60 * 24 * 5 * 1000;
			const sessionCookie = await auth().createSessionCookie(idToken, {
				expiresIn,
			});
			const options = {
				maxAge: expiresIn,
				httpOnly: true,
				secure: true,
				req,
				res,
			};

			//Add the cookie to the browser
			setCookie("session", sessionCookie, options);
		}

		return res.status(200).json({});
	} else {
		return res.status(401).json({
			error: {
				message: "Unauthorized",
			},
		});
	}
}
