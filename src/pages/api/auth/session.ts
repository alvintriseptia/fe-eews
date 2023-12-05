import { getCookie } from "cookies-next";
import { auth } from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		return NextResponse.next();
	}

	const session = getCookie("session", { req, res });

	//Validate if the cookie exist in the request
	if (!session) {
		return res.status(401).json({
			error: {
				message: "Unauthorized",
			},
		});
	}

	//Use Firebase Admin to validate the session cookie
	const decodedClaims = await auth().verifySessionCookie(
		session.toString(),
		true
	);

	if (!decodedClaims) {
		return res.status(401).json({
			error: {
				message: "Unauthorized",
			},
		});
	}

	return res.status(200).json({});
}
