import "maplibre-gl/dist/maplibre-gl.css";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import {LoadingOverlay} from "@/components/_index";

function MyApp({ Component, pageProps: { ...pageProps } }) {
	return (
		<>
			<Toaster
				toastOptions={{
					success: {
						style: {
							background: "#5ACA9C",
							color: "#fff",
						},
					},
					error: {
						style: {
							background: "#5F0102",
							color: "#fff",
						},
					},
				}}
			/>
			<LoadingOverlay />
			<Component {...pageProps} />
		</>
	);
}

export default MyApp;
