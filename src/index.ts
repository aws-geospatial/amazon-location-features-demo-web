import useAuth from "./hooks/useAuth";
import useClient from "./hooks/useClient";
import useGeofence from "./hooks/useGeofence";
import useMap from "./hooks/useMap";
import usePersistedData from "./hooks/usePersistedData";
import usePlace from "./hooks/usePlace";
import useRecordViewPage from "./hooks/useRecordViewPage";
import useRoute from "./hooks/useRoute";
import { EventTypeEnum, TriggeredByEnum } from "./types/Enums";
import { record } from "./utils/analyticsUtils";
import { debounce } from "./utils/debounce";
import { clearStorage } from "./utils/localstorageUtils";

export { default as DemoPage } from "./atomicui/pages/DemoPage/DemoPage";
export {
	useAuth,
	useMap,
	useClient,
	useGeofence,
	usePlace,
	useRoute,
	usePersistedData,
	useRecordViewPage,
	EventTypeEnum,
	TriggeredByEnum,
	record,
	debounce,
	clearStorage
};
