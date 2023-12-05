import React from "react";
import LoginView from "@/views/LoginView";
import UserController from "@/controllers/UserController";
import Head from "next/head";

export default class Login extends React.Component {
	render() {
		const controller = new UserController();
		return <>
			<Head>
				<title>InaEEWS</title>
			</Head>
			<LoginView controller={controller}/>
		</>
	}
}
