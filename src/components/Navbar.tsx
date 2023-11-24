"use client";
import Link from "next/link";
import React from "react";
import BMKGLogo from "@/assets/images/bmkg-logo.png";
import Image from "next/image";
import {
	ArrowLeftOnRectangleIcon,
	ArrowRightOnRectangleIcon,
	BookOpenIcon,
	ChartBarIcon,
	HomeIcon,
} from "@heroicons/react/24/outline";

interface NavlinkProps {
	icon: React.ReactNode| React.ReactElement<any, string | React.JSXElementConstructor<any>>;
	label: string;
	link: string;
	backgroundColor: string | null;
	fontStyle: string | null;
} 

class Navlink extends React.Component<NavlinkProps> {
	state = {
		icon: (<></>) as React.ReactNode,
		label: "",
		link: "",
		backgroundColor: "bg-transparent",
		fontStyle: "text-white/50 hover:text-white",
	};

	constructor(props: NavlinkProps) {
		super(props);
		this.state = { ...props };
	}

	render() {
		return (
			<Link href={this.state.link}>
				<button
					className={`px-3 py-2 flex gap-x-2  text-base rounded-lg items-center ${this.state.backgroundColor} ${this.state.fontStyle} hover:bg-eews-boulder transition-all`}
				>
					{this.state.icon}
					<span>{this.state.label}</span>
				</button>
			</Link>
		);
	}
}

interface HeaderInfoProps {
	total: number;
	title: string;
}

class HeaderInfo extends React.Component<HeaderInfoProps> {
	state = {
		total: 0,
		title: "",
	};
	constructor(props: HeaderInfoProps) {
		super(props);
		this.state = { ...props };
	}
	render() {
		return (
			<div className="flex gap-x-1 items-center">
				<span className="text-2xl font-semibold text-eews-golden-fizz">
					{this.state.title.includes("Magnitude")
						? this.state.total.toFixed(1)
						: this.state.total.toFixed(0)}
				</span>
				<span className="text-xs text-white whitespace-pre-line">
					{this.state.title}
				</span>
			</div>
		);
	}
}

export interface NavbarProps {
	isLoggedIn: boolean;
	navLinks: NavlinkProps[];
	totalEarthquakes: number;
	maximumMagnitude: number;
	minimumMagnitude: number;
    headerInfos: HeaderInfoProps[] | [];
    btnAuth: NavlinkProps | null;
};

class Navbar extends React.Component<NavbarProps> {
    state = {
        isLoggedIn: false,
        navLinks: [
            {
                icon: <HomeIcon className="w-6 h-6" />,
                label: "Beranda",
                link: "/",
                backgroundColor: "bg-eews-dark",
                fontStyle: "text-white font-semibold",
            },
        ] as NavlinkProps[],
        totalEarthquakes: 0,
        maximumMagnitude: 0,
        minimumMagnitude: 0,
        headerInfos: [
			{ total: 0, title: "Jumlah \nKejadian Gempa" },
			{ total: 0, title: "Maksimum \nMagnitude" },
			{ total: 0, title: "Minimum \nMagnitude" },
		] as HeaderInfoProps[],
        btnAuth: {
            icon: <ArrowRightOnRectangleIcon className="w-6 h-6" />,
            label: "Masuk",
            link: "/login",
            backgroundColor: "bg-eews-mmi-V",
            fontStyle: "text-white font-semibold",
        } as NavlinkProps,
    };

    constructor(props: NavbarProps) {
        super(props);
        if (props.navLinks && props.navLinks.length > 0) {
            this.state.navLinks = props.navLinks;
        }
        if (props.headerInfos && props.headerInfos.length > 0) {
            this.state.headerInfos = props.headerInfos;
        }
        if (props.btnAuth) {
            this.state.btnAuth = props.btnAuth;
        }
        
        this.state = { 
            ...props,
            navLinks: this.state.navLinks,
            headerInfos: this.state.headerInfos,
            btnAuth: this.state.btnAuth,
         };
    }

    componentDidMount(): void {
        let currentHeaderInfos = this.state.headerInfos;
		if (this.props.totalEarthquakes && this.props.totalEarthquakes > 0) {
			currentHeaderInfos[0].total = this.props.totalEarthquakes;
		}

		if (this.props.maximumMagnitude && this.props.maximumMagnitude > 0) {
			currentHeaderInfos[1].total = this.props.maximumMagnitude;
		}

		if (this.props.minimumMagnitude && this.props.minimumMagnitude > 0) {
			currentHeaderInfos[2].total = this.props.minimumMagnitude;
		}

        let currentBtnAuth = this.state.btnAuth;
        if(this.props.isLoggedIn){
            currentBtnAuth = {
                icon: <ArrowLeftOnRectangleIcon className="w-6 h-6" />,
                label: "Keluar",
                link: "/logout",
                backgroundColor: "bg-eews-mmi-X",
                fontStyle: "text-white font-semibold",
            };
        }else{
            currentBtnAuth = {
                icon: <ArrowRightOnRectangleIcon className="w-6 h-6" />,
                label: "Masuk",
                link: "/login",
                backgroundColor: "bg-eews-mmi-V",
                fontStyle: "text-white font-semibold",
            };
        }

		this.setState({ headerInfos: currentHeaderInfos, btnAuth: currentBtnAuth });
    }

	render() {
		return (
			<nav className="flex justify-between gap-x-4 py-3 px-10 pl-20 bg-eews-black-russian">
				<section className="flex gap-x-10">
					<div className="flex gap-x-3">
						<Image src={BMKGLogo} alt="BMKG Logo" width={40} height={40} />
						<h1 className="text-4xl font-semibold text-white">InaEEWS</h1>
					</div>

					<div className="flex bg-eews-mirage rounded-lg">
						{this.state.navLinks.map((navLink, index) => (
							<Navlink {...navLink} key={index} />
						))}
					</div>
				</section>

				<section className="flex gap-x-4">
					{this.state.headerInfos.map(
						(headerInfo, index) =>
							headerInfo.total > 0 && <HeaderInfo {...headerInfo} key={index} />
					)}

					<Navlink {...this.state.btnAuth} />
				</section>
			</nav>
		);
	}
}

export default Navbar;
