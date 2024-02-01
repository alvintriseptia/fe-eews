import React, { Component } from "react";

interface ModalDialogProps {
	onCancel: () => void;
	onConfirm: () => void;
	open: boolean;
	title: string;
	message: string;
}

export default class ModalDialog extends Component<ModalDialogProps> {
	state = {
		isOpen: false,
	};

	constructor(props: ModalDialogProps) {
		super(props);
		this.state.isOpen = props.open;
	}

	componentDidUpdate(prevProps: ModalDialogProps) {
		if (prevProps.open !== this.props.open) {
			this.setState({ isOpen: this.props.open });
		}
	}

	handleCancel = () => {
		this.props.onCancel();
		this.setState({ isOpen: false });
	};

	handleConfirm = () => {
		this.props.onConfirm();
		this.setState({ isOpen: false });
	};

	render() {
		return (
			<>
				{/* Dialog element */}
				{this.state.isOpen && (
					<dialog className="fixed w-screen h-screen z-[9999] inset-0 flex items-center justify-center bg-black bg-opacity-50">
						<div className="bg-white p-4 rounded shadow">
							{/* title */}
							<h1 className="text-xl font-medium mb-4">{this.props.title}</h1>

							<hr className="border-gray-300 mb-4" />

							{/* message */}
							<p className="mb-8">{this.props.message}</p>
							<div className="flex justify-end">
								<button
									className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
									onClick={this.handleCancel}
								>
									Cancel
								</button>
								<button
									className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
									onClick={this.handleConfirm}
								>
									Confirm
								</button>
							</div>
						</div>
					</dialog>
				)}
			</>
		);
	}
}
