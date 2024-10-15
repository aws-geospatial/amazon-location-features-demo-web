/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { LocationClientConfig } from "@aws/amazon-location-utilities-auth-helper";
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
			createPlacesClient: (locationClientConfig: LocationClientConfig) => {
				try {
					const placesClient = clientService.createPlacesClient(locationClientConfig);
					setState({ placesClient });
				} catch (error) {
					errorHandler(error, t("error_handler__failed_create_places_client.text") as string);
				}
			},
			createRoutesClient: (locationClientConfig: LocationClientConfig, region: string) => {
				try {
					const routesClient = clientService.createRoutesClient(locationClientConfig, region);
					setState({ routesClient });
				} catch (error) {
					errorHandler(error, t("error_handler__failed_create_routes_client.text") as string);
				}
			},
			resetPlacesAndRoutesClients: () => {
				setState({ placesClient: undefined, routesClient: undefined });
			},
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
			resetLocationAndIotClients: () => {
				setState({ locationClient: undefined, iotClient: undefined });
			},
			resetStore: () => {
				setState({ placesClient: undefined, routesClient: undefined, locationClient: undefined, iotClient: undefined });
				setInitial();
			}
		}),
		[clientService, setState, t, setInitial]
	);

	return { ...methods, ...store };
};

export default useClient;
