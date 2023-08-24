import { GrabMapEnum, OpenDataMapEnum } from "@demo/types";

export type ShowStateType = {
	gridLoader: boolean;
	sidebar: boolean;
	routeBox: boolean;
	signInModal: boolean;
	connectAwsAccount: boolean;
	authGeofenceBox: boolean;
	authTrackerBox: boolean;
	settings: boolean;
	stylesCard: boolean;
	trackingDisclaimerModal: boolean;
	about: boolean;
	grabDisclaimerModal: boolean;
	openDataDisclaimerModal: boolean;
	mapStyle?: GrabMapEnum | OpenDataMapEnum;
	unauthGeofenceBox: boolean;
	unauthTrackerBox: boolean;
	startUnauthSimulation: boolean;
	unauthSimulationDisclaimerModal: boolean;
	unauthSimulationExitModal: boolean;
};
