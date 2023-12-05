import React from "react";
import { observer } from "mobx-react";
import { UserController } from "@/controllers/_index";
import { observe } from "mobx";

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
				<div className="bg-white p-8 rounded shadow">
					<div className="mb-4">
						<label
							htmlFor="email"
							className="block text-gray-700 font-bold mb-2"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
							placeholder="Enter your email"
							onChange={(e) => this.onChangeEmail(e.target.value)}
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="password"
							className="block text-gray-700 font-bold mb-2"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
							placeholder="Enter your password"
							onChange={(e) => this.onChangePassword(e.target.value)}
						/>
					</div>
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						onClick={this.login}
					>
						Sign In
					</button>
				</div>
			</section>
		);
	}
}

export default observer(LoginView);
