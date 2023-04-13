/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ToastType } from "@demo/types";
import { ToastContainer as RTToastContainer, toast } from "react-toastify";
import "./styles.scss";

export const ToastContainer = () => (
	<RTToastContainer
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

export const showToast = (params: { content: string; type: ToastType }) => {
	const { type, content } = params;

	switch (type) {
		case "info":
			toast.info(content);
			break;
		case "success":
			toast.success(content);
			break;
		case "warning":
			toast.warn(content);
			break;
		case "error":
			toast.error(content);
			break;
		default:
			toast(content);
			break;
	}
};
