import { appConfig } from "@demo/core/constants";

const {
	ENV: { CF_TEMPLATE, REGION }
} = appConfig;

export const transformCloudFormationLink = (newRegion: string) => {
	return (CF_TEMPLATE as string).replaceAll(REGION, newRegion);
};
