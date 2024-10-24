import { appConfig } from "@demo/core/constants";

const { IDENTITY_POOL_IDS, PERSIST_STORAGE_KEYS } = appConfig;

export const setClosestRegion = async (regions = Object.keys(IDENTITY_POOL_IDS)) => {
	let fastestRegion = localStorage.getItem(PERSIST_STORAGE_KEYS.FASTEST_REGION!);

	if (!regions.includes(fastestRegion!)) {
		fastestRegion = null;
	}

	if (fastestRegion) {
		return;
	}

	const mapping: { [key: string]: number } = {};

	await Promise.all(
		regions.map(async region => {
			try {
				const start = Date.now();
				await fetch(`https://dynamodb.${region}.amazonaws.com`);
				const timeSpent = Date.now() - start;

				if (!mapping[region] || timeSpent < mapping[region]) {
					mapping[region] = timeSpent;
				}
			} catch (error) {
				console.error({ error });
			}
		})
	);

	for (const [regionName, latency] of Object.entries(mapping)) {
		if (!fastestRegion || latency < mapping[fastestRegion]) {
			fastestRegion = regionName;
		}
	}

	fastestRegion && localStorage.setItem(PERSIST_STORAGE_KEYS.FASTEST_REGION, fastestRegion);
};
