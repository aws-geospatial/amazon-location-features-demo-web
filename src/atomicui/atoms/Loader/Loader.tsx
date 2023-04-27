/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Loader as AmplifyLoader, View } from "@aws-amplify/ui-react";

const Loader = () => (
	<View data-testid="loader-container" marginTop={300} marginBottom={300} width={"100%"} textAlign={"center"}>
		<AmplifyLoader width={100} />
	</View>
);

export default Loader;
