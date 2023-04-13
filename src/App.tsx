/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { StrictMode, Suspense } from "react";

import { Loader } from "@aws-amplify/ui-react";
import { AppWrapper, RouteChunks, ToastContainer } from "@demo/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const App = () => {
	const router = createBrowserRouter(RouteChunks);
	const queryClient = new QueryClient();

	return (
		<StrictMode>
			<Suspense
				fallback={
					<Loader
						width="40px"
						height="40px"
						position="absolute"
						top="50%"
						left="50%"
						transform="translate(-50%, -50%)"
					/>
				}
			>
				<QueryClientProvider client={queryClient}>
					<AppWrapper>
						<ToastContainer />
						<RouterProvider fallbackElement={<>OOPS!</>} router={router} />
					</AppWrapper>
				</QueryClientProvider>
			</Suspense>
		</StrictMode>
	);
};

export default App;
