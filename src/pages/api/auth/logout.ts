import { setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	//Remove the value and expire the cookie
	if (req.method !== "POST") {
		return NextResponse.next();
	}

	const options = {
		maxAge: -1,
		httpOnly: true,
		secure: true,
		req,
		res,
	};

	setCookie("session", "", options);
	return res.status(200).json({});
}
