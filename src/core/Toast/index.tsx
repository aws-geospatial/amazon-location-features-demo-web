/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ToastType } from "@demo/types";
import { ToastContainer as RTToastContainer, toast } from "react-toastify";
import "./styles.scss";

export const ToastContainer = () => (
	<RTToastContainer
		className={"toast-container"}
		enableMultiContainer
		containerId={"toast-container"}
		position="top-center"
		autoClose={10000}
		hideProgressBar
		newestOnTop={true}
		closeOnClick
		pauseOnFocusLoss
		draggable={false}
		pauseOnHover
		theme="dark"
	/>
);

export const UnauthSimulationToastContainer = () => (
	<RTToastContainer
		className={"unauth-simulation-toast-container"}
		enableMultiContainer
		containerId={"unauth-simulation-toast-container"}
		position="top-center"
		autoClose={3000}
		hideProgressBar
		newestOnTop={false}
		closeOnClick
		pauseOnFocusLoss
		draggable={false}
		pauseOnHover
		theme="dark"
	/>
);

export const showToast = (params: { content: string; type: ToastType; containerId?: string }) => {
	const { type, content, containerId = "toast-container" } = params;

	switch (type) {
		case "info":
			toast.info(content, { containerId });
			break;
		case "success":
			toast.success(content, { containerId });
			break;
		case "warning":
			toast.warn(content, { containerId });
			break;
		case "error":
			toast.error(content, { containerId });
			break;
		default:
			toast(content, { containerId });
			break;
	}
};
