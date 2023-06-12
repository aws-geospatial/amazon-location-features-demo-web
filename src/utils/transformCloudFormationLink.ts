export const transformCloudFormationLink = (urlString: string, newRegion: string) => {
	return urlString.replace(/us-west-2/g, newRegion);
};
