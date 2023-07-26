import sleep from "./sleep";

let failCount = 0;

export const getCountryCodeByIp: () => Promise<string> = async () => {
	try {
		const jsonValue = await fetch("https://api.country.is/");
		const value = await jsonValue.json();

		failCount = 0;

		return value.country;
	} catch (error) {
		failCount++;
		console.log("error: ", error);

		// try three times before failing
		if (failCount === 3) {
			throw error;
		} else {
			sleep(1000);
			return await getCountryCodeByIp();
		}
	}
};
