"use client";
import TracerViewCanvas from "@/views/TracerViewCanvas";
import Head from "next/head";
import React from "react";

function TracerViewCanvasPage() {
	if (typeof window === "undefined") return <></>;
	return (
		<>
			<Head>
				<title>TEWS | Tracer View</title>
			</Head>
			<TracerViewCanvas />
		</>
	);
}

export default TracerViewCanvasPage;
