import { render, screen } from "@testing-library/react";

import SearchBox from "./SearchBox";

describe("<SearchBox />", () => {
	let searchBarContainer: HTMLElement;

	beforeEach(async () => {
		/* eslint-disable  @typescript-eslint/no-explicit-any */
		render(
			<SearchBox
				mapRef={{ getCenter: jest.fn() } as any}
				isSideMenuExpanded={false}
				onToggleSideMenu={jest.fn()}
				setShowRouteBox={jest.fn()}
				isRouteBoxOpen={false}
				isGeofenceBoxOpen={false}
				isTrackingBoxOpen={false}
				isSettingsOpen={false}
				isStylesCardOpen={false}
			/>
		);

		// await because the `SearchBox` component has side-effects in react-tooltip, thus we need to wait for them to be completed
		searchBarContainer = await screen.findByTestId("search-bar-container");
	});

	it("should render successfully", () => {
		expect(searchBarContainer).toBeInTheDocument();
	});
});
