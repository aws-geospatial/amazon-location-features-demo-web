import appConfig from "./core/constants/appConfig";
import useAmplifyAuth from "./hooks/useAmplifyAuth";
import useAmplifyMap from "./hooks/useAmplifyMap";
import useAws from "./hooks/useAws";
import useAwsGeofence from "./hooks/useAwsGeofence";
import useAwsPlace from "./hooks/useAwsPlace";
import useAwsRoute from "./hooks/useAwsRoute";
import useAwsTracker from "./hooks/useAwsTracker";
import usePersistedData from "./hooks/usePersistedData";
import useRecordViewPage from "./hooks/useRecordViewPage";
import { EsriMapEnum, EventTypeEnum, TriggeredByEnum } from "./types/Enums";
import { record } from "./utils/analyticsUtils";
import { debounce } from "./utils/debounce";
import { clearStorage } from "./utils/localstorageUtils";

export * as theme from "./theme";
export { default as DemoPage } from "./atomicui/pages/DemoPage/DemoPage";
export {
	appConfig as demoAppConfig,
	useAmplifyAuth,
	useAmplifyMap,
	useAws,
	useAwsGeofence,
	useAwsPlace,
	useAwsRoute,
	useAwsTracker,
	usePersistedData,
	useRecordViewPage,
	EsriMapEnum,
	EventTypeEnum,
	TriggeredByEnum,
	record,
	debounce,
	clearStorage
};
