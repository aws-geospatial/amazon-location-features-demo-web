/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useClientService } from "@demo/services";
import { useClientStore } from "@demo/stores";
import { CognitoIdentityCredentials } from "@demo/types";
import { errorHandler } from "@demo/utils/errorHandler";
import { useTranslation } from "react-i18next";

const useClient = () => {
	const store = useClientStore();
	const { setInitial } = store;
	const { setState } = useClientStore;
	const clientService = useClientService();
	const { t } = useTranslation();

	const methods = useMemo(
		() => ({
			createLocationClient: (credentials: CognitoIdentityCredentials, region: string) => {
				try {
					const locationClient = clientService.createLocationClient(credentials, region);
					setState({ locationClient });
				} catch (error) {
					errorHandler(error, t("error_handler__failed_create_location_client.text") as string);
				}
			},
			createIotClient: (credentials: CognitoIdentityCredentials, region: string) => {
				try {
					const iotClient = clientService.createIotClient(credentials, region);
					setState({ iotClient });
				} catch (error) {
					errorHandler(error, t("error_handler__failed_create_iot_client.text") as string);
				}
			},
			resetStore: () => {
				setState({ locationClient: undefined, iotClient: undefined });
				setInitial();
			}
		}),
		[clientService, setState, t, setInitial]
	);

	return { ...methods, ...store };
};

export default useClient;
