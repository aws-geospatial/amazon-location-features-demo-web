export const getDomainName = (url: string) =>
	url?.startsWith("http://") || url.startsWith("https://") ? url.split("//")[1].replace("/", "") : url;
