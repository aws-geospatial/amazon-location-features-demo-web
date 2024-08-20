export const getDomainName = (url: string, isWebSocketUrl?: boolean) => {
	let string = url?.startsWith("http://") || url.startsWith("https://") ? url.split("//")[1] : url;

	if (string.endsWith("/")) {
		string = string.slice(0, -1);
	}

	const splitStr = string.split(".");

	if (!!isWebSocketUrl && !splitStr[0].endsWith("-ats")) {
		string = `${splitStr[0]}-ats.${splitStr.splice(1).join(".")}`;
	}

	return string;
};
