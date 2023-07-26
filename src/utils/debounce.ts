/* eslint-disable @typescript-eslint/no-explicit-any */
const debounce = (func: any, timeout: number) => {
	let timer: NodeJS.Timeout;
	return (...args: any[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
};

export default debounce;
