// import NextAuth from "next-auth";
// import { FirestoreAdapter } from "@auth/firebase-adapter";
// import { cert } from "firebase-admin/app";
// import Auth0Provider from "next-auth/providers/auth0";

// export const authOptions = {
// 	providers: [
//         Auth0Provider({
//           clientId: process.env.AUTH0_CLIENT_ID,
//           clientSecret: process.env.AUTH0_CLIENT_SECRET,
//           issuer: process.env.AUTH0_ISSUER
//         })
// 	],
// 	adapter: FirestoreAdapter({
// 		credential: cert({
// 			projectId: process.env.FIREBASE_PROJECT_ID,
// 			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
// 			privateKey: process.env.FIREBASE_PRIVATE_KEY,
// 		}),
// 	}),
// };

// export default NextAuth(authOptions);
