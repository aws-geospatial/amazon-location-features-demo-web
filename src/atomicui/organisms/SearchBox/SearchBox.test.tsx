import i18n from "@demo/locales/i18n";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import SearchBox from "./SearchBox";

describe("<SearchBox />", () => {
	let searchBarContainer: HTMLElement;

	beforeEach(async () => {
		/* eslint-disable  @typescript-eslint/no-explicit-any */
		render(
			<I18nextProvider i18n={i18n}>
				<SearchBox
					mapRef={{ getCenter: jest.fn() } as any}
					isSideMenuExpanded={false}
					onToggleSideMenu={jest.fn()}
					setShowRouteBox={jest.fn()}
					isRouteBoxOpen={false}
					isAuthGeofenceBoxOpen={false}
					isAuthTrackerBoxOpen={false}
					isSettingsOpen={false}
					isStylesCardOpen={false}
					value=""
					setValue={jest.fn()}
				/>
			</I18nextProvider>
		);

		// await because the `SearchBox` component has side-effects in react-tooltip, thus we need to wait for them to be completed
		searchBarContainer = await screen.findByTestId("search-bar-container");
	});

	it("should render successfully", () => {
		expect(searchBarContainer).toBeInTheDocument();
	});
});
