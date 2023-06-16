/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapProviderEnum } from "@demo/types";
import { RenderResult, act, fireEvent, render, screen } from "@testing-library/react";

import MapButtons from "./MapButtons";

describe("<MapButtons/>", () => {
	let openStylesCard = false;

	let mapButtons: HTMLElement;
	let mapStylesButtons: HTMLElement;
	let geofenceControlButton: HTMLElement;
	let mapStylesCard: HTMLElement | null;
	// let mapProviderButtonEsri: HTMLElement | null;
	let esriMapStyles: HTMLElement | null;
	let mapStylesItemsEsriStreets: HTMLElement | null;
	let mapProviderButtonHere: HTMLElement | null;
	let hereMapStyles: HTMLElement | null;
	// let mapStylesItemsHereContrast: HTMLElement | null;
	let mapProviderButtonGrab: HTMLElement | null;
	let grabMapStyles: HTMLElement | null;
	// let mapStylesItemsGrabDark: HTMLElement | null;

	let onCloseSidebar: jest.Mock<any, any, any>;
	let onOpenConnectAwsAccountModal: jest.Mock<any, any, any>;
	let onOpenSignInModal: jest.Mock<any, any, any>;
	let onShowGeofenceBox: jest.Mock<any, any, any>;
	const onShowGridLoader = jest.fn();
	const handleMapProviderChange = jest.fn();
	const handleMapStyleChange = jest.fn();

	beforeEach(() => {
		jest.useFakeTimers();
	});
	afterEach(() => jest.useRealTimers());

	const renderComponent = async (): Promise<RenderResult> => {
		const setOpenStylesCard = (isOpen: boolean) => {
			openStylesCard = isOpen;
		};

		onCloseSidebar = jest.fn();
		onOpenConnectAwsAccountModal = jest.fn();
		onOpenSignInModal = jest.fn();
		onShowGeofenceBox = jest.fn();

		const renderedComponent = render(
			<MapButtons
				openStylesCard={openStylesCard}
				setOpenStylesCard={setOpenStylesCard}
				onCloseSidebar={onCloseSidebar}
				onOpenConnectAwsAccountModal={onOpenConnectAwsAccountModal}
				onOpenSignInModal={onOpenSignInModal}
				onShowGeofenceBox={onShowGeofenceBox}
				isGrabVisible={true}
				showGrabDisclaimerModal={false}
				onShowGridLoader={onShowGridLoader}
				// handleMapProviderChange={handleMapProviderChange}
				handleMapStyleChange={handleMapStyleChange}
			/>
		);

		mapButtons = await screen.findByTestId("map-buttons-container");
		mapStylesButtons = await screen.findByTestId("map-styles-button");
		geofenceControlButton = await screen.findByTestId("geofence-control-button");
		mapStylesCard = screen.queryByTestId("map-styles-card");
		// mapProviderButtonEsri = screen.queryByTestId("map-data-provider-esri");
		esriMapStyles = screen.queryByTestId("esri-map-styles");
		mapStylesItemsEsriStreets = screen.queryByTestId("map-style-item-Streets");
		mapProviderButtonHere = screen.queryByTestId("map-data-provider-here");
		hereMapStyles = screen.queryByTestId("here-map-styles");
		// mapStylesItemsHereContrast = screen.queryByTestId("map-style-item-Contrast");
		mapProviderButtonGrab = screen.queryByTestId("map-data-provider-grab");
		grabMapStyles = screen.queryByTestId("grab-map-styles");
		// mapStylesItemsGrabDark = screen.queryByTestId("map-style-item-Dark");

		return renderedComponent;
	};

	it("should render successfully", async () => {
		await renderComponent();
		expect(mapButtons).toBeInTheDocument();
	});

	it("should be able to click on map styles shortcut and view the map providers and styles", async () => {
		let renderedComponent = await renderComponent();
		expect(mapStylesCard).toBe(null);
		expect(mapStylesButtons.className).not.toContain("active");
		act(() => mapStylesButtons.click());
		renderedComponent.unmount();

		renderedComponent = await renderComponent();
		expect(mapStylesCard).toBeInTheDocument();
		expect(mapStylesButtons.className).toContain("active");
		act(() => mapStylesButtons.click());
		renderedComponent.unmount();

		await renderComponent();
		expect(mapStylesCard).toBe(null);
	});

	it("should change the map provider when a certain map provider is selected", async () => {
		openStylesCard = true;
		await renderComponent();

		expect(esriMapStyles).toBeInTheDocument();
		expect(hereMapStyles).toBeNull();
		expect(grabMapStyles).toBeNull();

		fireEvent.click(mapProviderButtonHere as HTMLElement);
		expect(handleMapProviderChange).toBeCalledTimes(1);

		fireEvent.click(mapProviderButtonGrab as HTMLElement);
		expect(handleMapProviderChange).toBeCalledTimes(2);
	});

	it("should change the map style when a certain map style is selected", async () => {
		openStylesCard = true;
		await renderComponent();

		expect(mapStylesItemsEsriStreets).not.toContain("mb-style-container selected");
		fireEvent.click(mapStylesItemsEsriStreets as HTMLElement);
		expect(mapStylesItemsEsriStreets?.className).toContain("mb-style-container selected");
	});

	it("should be able to click on geofence shortcut and get to connect AWS account", async () => {
		await renderComponent();
		expect(geofenceControlButton.className).not.toContain("active");
		act(() => geofenceControlButton.click());
		expect(onOpenConnectAwsAccountModal).toBeCalled();
	});
});
