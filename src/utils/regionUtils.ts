import { appConfig } from "@demo/core/constants";

const {
	ENV: { REGION_EAST, REGION_ASIA, REGION_WEST, IDENTITY_POOL_ID_EAST, IDENTITY_POOL_ID_ASIA, IDENTITY_POOL_ID_WEST },
	PERSIST_STORAGE_KEYS
} = appConfig;

export const setClosestRegion = async (regions = [REGION_EAST, REGION_WEST, REGION_ASIA]) => {
	let fastestRegion = localStorage.getItem(PERSIST_STORAGE_KEYS.DEFAULT_REGION!);

	if (!regions.includes(fastestRegion)) {
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
				console.log("error: ", error);
			}
		})
	);

	for (const [regionName, latency] of Object.entries(mapping)) {
		if (!fastestRegion || latency < mapping[fastestRegion]) {
			fastestRegion = regionName;
		}
	}

	fastestRegion && localStorage.setItem(PERSIST_STORAGE_KEYS.DEFAULT_REGION, fastestRegion);
};

export const getPoolByRegion = (region: string) => {
	switch (region) {
		case REGION_WEST:
			return IDENTITY_POOL_ID_WEST;
		case REGION_ASIA:
			return IDENTITY_POOL_ID_ASIA;
		case REGION_EAST:
			return IDENTITY_POOL_ID_EAST;
	}
};
