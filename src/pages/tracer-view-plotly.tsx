"use client";
import TracerViewPlotly from "@/views/TracerViewPlotly";
import Head from "next/head";
import React from "react";

function TracerViewPlotlyPage() {
	if (typeof window === "undefined") return <></>;
	return (
		<>
			<Head>
				<title>TEWS | Tracer View</title>
			</Head>
			<TracerViewPlotly />
		</>
	);
}

export default TracerViewPlotlyPage;
