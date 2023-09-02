export const getDomainName = (url: string) => {
	const string = url?.startsWith("http://") || url.startsWith("https://") ? url.split("//")[1] : url;

	if (string.endsWith("/")) {
		return string.slice(0, -1);
	}

	return string;
};
