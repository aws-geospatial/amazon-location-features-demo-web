/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { StrictMode, Suspense } from "react";

import { Loader } from "@aws-amplify/ui-react";
import { AppWrapper, RouteChunks, ToastContainer } from "@demo/core";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import appConfig from "./core/constants/appConfig";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_APP_VERSION },
	ENV: { APP_VERSION }
} = appConfig;

const StaticLoader = () => (
	<Loader width="40px" height="40px" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" />
);

const router = createBrowserRouter(RouteChunks);

const App = () => {
	const localAppVersion = localStorage.getItem(LOCAL_APP_VERSION) || "";

	if (localAppVersion === APP_VERSION) {
		return (
			<StrictMode>
				<Suspense fallback={<StaticLoader />}>
					<AppWrapper>
						<ToastContainer />
						<RouterProvider fallbackElement={<StaticLoader />} router={router} />
					</AppWrapper>
				</Suspense>
			</StrictMode>
		);
	} else {
		localStorage.clear();
		localStorage.setItem(LOCAL_APP_VERSION, APP_VERSION);
		window.location.reload();

		return <StaticLoader />;
	}
};

export default App;
