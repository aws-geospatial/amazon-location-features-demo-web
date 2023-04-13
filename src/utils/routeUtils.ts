/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

interface ITree {
	[key: string]: string[] | ITree | null;
}

interface IResult {
	[key: string]: { getPath: (queryParams?: ITree) => string; getElementKey: () => string };
}

export const buildRouteTree = (rawTree: ITree) =>
	(function loop(tree, path: string[] = []): IResult {
		return Object.keys(tree)
			.map(k => [k, tree[k]])
			.reduce((acc, [k, value]) => {
				const key = k as string;
				const xPath = [...path, key];

				const routeData = {
					getPath: makeGetPath(`/${xPath.join("/")}`),
					getElementKey: () => key
				};

				if (value === null) {
					return { ...acc, [key]: routeData };
				}

				return {
					...acc,
					[key]: {
						...loop(value as ITree, xPath),
						...routeData
					}
				};
			}, {});
	})(rawTree);

const makeGetPath =
	(path: string) =>
	(queryParams?: ITree): string => {
		const params = queryParams
			? `?${Object.entries(queryParams)
					.map(x => x.join("="))
					.join("&")}`
			: "";
		return `${path}${params}`;
	};
