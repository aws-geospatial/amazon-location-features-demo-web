/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { StrictMode, Suspense } from "react";

import { Loader } from "@aws-amplify/ui-react";
import { AppWrapper } from "@demo/core/AppWrapper";
import { RouteChunks } from "@demo/core/Routes";
import { ToastContainer } from "@demo/core/Toast";
import { appConfig } from "@demo/core/constants";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

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
