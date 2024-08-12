import useAuth from "./hooks/useAuth";
import useClient from "./hooks/useClient";
import useGeofence from "./hooks/useGeofence";
import useMap from "./hooks/useMap";
import usePersistedData from "./hooks/usePersistedData";
import usePlace from "./hooks/usePlace";
import useRecordViewPage from "./hooks/useRecordViewPage";
import useRoute from "./hooks/useRoute";
import useTracker from "./hooks/useTracker";
import { EventTypeEnum, TriggeredByEnum } from "./types/Enums";
import { record } from "./utils/analyticsUtils";
import { debounce } from "./utils/debounce";
import { clearStorage } from "./utils/localstorageUtils";

const useAmplifyAuth = () => ({
	configureAmplify: () => {},
	...useAuth
});
const useAmplifyMap = () => useMap();
const useAws = () => useClient();
const useAwsGeofence = () => useGeofence();
const useAwsPlace = () => usePlace();
const useAwsRoute = () => useRoute();
const useAwsTracker = () => useTracker();

export * as theme from "./theme";
export { default as DemoPage } from "./atomicui/pages/DemoPage/DemoPage";
export {
	useAmplifyAuth,
	useAmplifyMap,
	useAws,
	useAwsGeofence,
	useAwsPlace,
	useAwsRoute,
	useAwsTracker,
	useAuth,
	useMap,
	useClient,
	useGeofence,
	usePlace,
	useRoute,
	useTracker,
	usePersistedData,
	useRecordViewPage,
	EventTypeEnum,
	TriggeredByEnum,
	record,
	debounce,
	clearStorage
};
