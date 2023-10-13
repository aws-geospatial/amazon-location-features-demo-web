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
		autoClose={5000}
		hideProgressBar
		newestOnTop={false}
		closeOnClick
		pauseOnFocusLoss
		draggable={false}
		pauseOnHover
		theme="dark"
	/>
);

export const showToast = (params: { content: string; type: ToastType; containerId?: string; className?: string }) => {
	const { type, content, containerId = "toast-container", className } = params;

	switch (type) {
		case "info":
			toast.info(content, { containerId, className });
			break;
		case "success":
			toast.success(content, { containerId, className });
			break;
		case "warning":
			toast.warn(content, { containerId, className });
			break;
		case "error":
			toast.error(content, { containerId, className });
			break;
		default:
			toast(content, { containerId, className });
			break;
	}
};
