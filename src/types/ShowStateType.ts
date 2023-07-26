import { GrabMapEnum } from "@demo/types";

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
	mapStyle?: GrabMapEnum;
	unauthGeofenceBox: boolean;
	unauthTrackerBox: boolean;
	unauthSimulationDisclaimerModal: boolean;
	unauthSimulationExitModal: boolean;
};
