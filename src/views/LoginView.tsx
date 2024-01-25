import React from "react";
import { observer } from "mobx-react";
import { UserController } from "@/controllers/_index";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import BMKGLogo from "@/assets/images/bmkg-logo.png";
import Image from "next/image";

interface Props {
	controller: UserController;
}

class LoginView extends React.Component<Props> {
	state = {
		controller: {} as UserController,
		email: "",
		password: "",
		error: "",
	};

	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;

		this.onChangeEmail.bind(this);
		this.onChangePassword.bind(this);
	}

	login = async () => {
		const { controller, email, password } = this.state;
		
		await controller.login(email, password);
	};

	onChangeEmail = (value: string) => {
		this.setState({ email: value });
	};

	onChangePassword = (value: string) => {
		this.setState({ password: value });
	};
	render() {
		return (
			<section className="flex justify-center items-center h-screen">
				<div className="bg-[#222531] px-6 py-8 rounded-3xl shadow w-[412px]">
					<div className="flex justify-center mb-8 gap-x-4">
						<Image src={BMKGLogo} alt="BMKG Logo" width={40} height={40} />
						<h1 className="text-4xl text-white font-semibold">TEWS</h1>
					</div>
					<div className="mb-4">
						<label
							htmlFor="email"
							className="block text-white font-bold mb-2"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							className="w-full border border-gray-300 rounded-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:border-blue-500"
							onChange={(e) => this.onChangeEmail(e.target.value)}
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="password"
							className="block text-white font-bold mb-2"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							className="w-full border border-gray-300 rounded-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:border-blue-500"
							onChange={(e) => this.onChangePassword(e.target.value)}
						/>
					</div>
					<button
						className="bg-[#184130] hover:bg-tews-mmi-V transition-all text-white font-bold py-2 px-4 w-full rounded-full focus:outline-none focus:shadow-outline"
						onClick={this.login}
					>
						<ArrowRightOnRectangleIcon className="w-5 h-5 inline-block mr-2" />
						Masuk
					</button>
				</div>
			</section>
		);
	}
}

export default observer(LoginView);
