export const pass = msg => {
	console.log(`%c \u2714 ${msg}`, "color: green; font-size: 16px;");
};

export const fail = msg => {
	console.log(`%c \u2716 ${msg}`, "color: red; font-size: 16px;");
	throw new Error(msg);
};
