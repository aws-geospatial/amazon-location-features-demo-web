import { appConfig } from "@demo/core/constants";

const {
	ENV: { CF_TEMPLATE }
} = appConfig;

const CFRegion = new URL(CF_TEMPLATE).searchParams.get("region")!;

export const transformCloudFormationLink = (newRegion: string) => {
	return (CF_TEMPLATE as string).replaceAll(CFRegion, newRegion);
};
