/* eslint-disable @typescript-eslint/no-explicit-any */

const recurseExpression = (exp: any, prevPropertyRegex: RegExp, nextProperty: string): any => {
	if (!Array.isArray(exp)) return exp;
	if (exp[0] !== "coalesce") return exp.map(v => recurseExpression(v, prevPropertyRegex, nextProperty));

	const first = exp[1];
	const second = exp[2];

	let isMatch = Array.isArray(first) && first[0] === "get" && !!first[1].match(prevPropertyRegex)?.[0];

	isMatch = isMatch && Array.isArray(second) && second[0] === "get";
	isMatch = isMatch && !exp?.[4];

	if (!isMatch) return exp.map(v => recurseExpression(v, prevPropertyRegex, nextProperty));

	return ["coalesce", ["get", nextProperty], ["get", "name:en"], ["get", "name"]];
};

const updateLayer = (layer: any, prevPropertyRegex: RegExp, nextProperty: string) => {
	const nextLayer = {
		...layer,
		layout: {
			...layer.layout,
			"text-field": recurseExpression(layer.layout["text-field"], prevPropertyRegex, nextProperty)
		}
	};
	return nextLayer;
};

const setPreferredLanguage = (style: any, language: string) => {
	const nextStyle = { ...style };

	nextStyle.layers = nextStyle.layers.map((l: { type: string; layout: { [x: string]: any } }) => {
		if (l.type !== "symbol" || !l?.layout?.["text-field"]) return l;
		return updateLayer(l, /^name:([A-Za-z\-\_]+)$/g, `name:${language}`);
	});

	return nextStyle;
};

export const getStyleWithPreferredLanguage = async (styleUrl: string, preferredLanguage: string) => {
	return fetch(styleUrl)
		.then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok " + response.statusText);
			}
			return response.json();
		})
		.then(styleObject => {
			let so = { ...styleObject };

			if (preferredLanguage !== "en") {
				so = setPreferredLanguage(styleObject, preferredLanguage);
			}

			return so;
		})
		.catch(error => {
			console.error("Error fetching style:", error);
		});
};
