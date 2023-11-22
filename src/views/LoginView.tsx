import React from "react";
import { observer } from "mobx-react";
import { UserController } from "@/controllers/_index";
import { IUser } from "@/entities/_index";

interface Props {
	controller: UserController;
}

class LoginView extends React.Component<Props> {
	state = {
		controller: {} as UserController,
        user: {} as IUser,
	};
	constructor(props: Props) {
		super(props);
		this.state.controller = props.controller;
	}
    download(){}
	render() {
		return (
			<div className="text-7xl font-bold text-center p-10">
                <h1>LOGIN VIEW</h1>
			</div>
		);
	}
}

export default observer(LoginView);
