/* eslint-disable @typescript-eslint/no-explicit-any */
import { RenderResult, act, fireEvent, render, screen } from "@testing-library/react";

import MapButtons from "./MapButtons";

describe("<MapButtons/>", () => {
	let openStylesCard = false;

	let mapButtons: HTMLElement;
	let mapStylesButtons: HTMLElement;
	let geofenceControlButton: HTMLElement;
	let mapStylesCard: HTMLElement | null;
	let mapStylesItems: HTMLElement[] | null;
	let mapProviderButtonEsri: HTMLElement | null;
	// let mapProviderButtonHere: HTMLElement | null;
	let esriMapStyles: HTMLElement | null;
	let hereMapStyles: HTMLElement | null;

	let onCloseSidebar: jest.Mock<any, any, any>;
	let onOpenConnectAwsAccountModal: jest.Mock<any, any, any>;
	let onOpenSignInModal: jest.Mock<any, any, any>;
	let onShowGeofenceBox: jest.Mock<any, any, any>;
	const onShowGridLoader = jest.fn();
	const handleMapProviderChange = jest.fn();

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
				isGrabVisible={false}
				showGrabDisclaimerModal={false}
				onShowGridLoader={onShowGridLoader}
				handleMapProviderChange={handleMapProviderChange}
			/>
		);

		mapButtons = await screen.findByTestId("map-buttons-container");
		mapStylesButtons = await screen.findByTestId("map-styles-button");
		geofenceControlButton = await screen.findByTestId("geofence-control-button");
		mapStylesCard = screen.queryByTestId("map-styles-card");
		mapStylesItems = screen.queryAllByTestId("map-style-item");
		mapProviderButtonEsri = screen.queryByTestId("map-data-provider-esri");
		// mapProviderButtonHere = screen.queryByTestId("map-data-provider-here");
		esriMapStyles = screen.queryByTestId("esri-map-styles");
		hereMapStyles = screen.queryByTestId("here-map-styles");

		return renderedComponent;
	};

	it("should render successfully", async () => {
		await renderComponent();
		expect(mapButtons).toBeInTheDocument();
	});

	it("should toggle styles card visibility and add `active` class on map styles button click", async () => {
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
		fireEvent.click(mapProviderButtonEsri as HTMLElement);
		expect(handleMapProviderChange).toBeCalledTimes(1);
	});

	it("should add `selected` class when a certain style is selected/clicked", async () => {
		openStylesCard = true;
		await renderComponent();
		const mapStylesItem = mapStylesItems![mapStylesItems!.length - 1];

		expect(mapStylesItem.className).not.toContain("selected");
		act(() => mapStylesItem.click());
		expect(mapStylesItem.className).toContain("selected");
		openStylesCard = false;
	});

	it("should toggle styles card visibility and add `active` class on map styles button click", async () => {
		await renderComponent();
		expect(geofenceControlButton.className).not.toContain("active");
		act(() => geofenceControlButton.click());
		expect(onOpenConnectAwsAccountModal).toBeCalled();
	});
});
