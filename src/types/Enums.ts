/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export enum EventTypeEnum {
	// Session
	SESSION_START = "_session.start",
	SESSION_END = "SESSION_END",
	SESSION_STOP = "_session.stop",

	// Page
	VIEW_PAGE = "VIEW_PAGE",
	LEAVE_PAGE = "LEAVE_PAGE",

	APPLICATION_ERROR = "APPLICATION_ERROR",

	// Sample
	SAMPLE_CLICKED = "SAMPLE_CLICKED",
	SAMPLE_FILTERS_APPLIED = "SAMPLE_FILTERS_APPLIED",
	LAUNCH_STACK_BUTTON_CLICKED = "LAUNCH_STACK_BUTTON_CLICKED",
	CLONE_COMMAND_COPIED = "CLONE_COMMAND_COPIED",
	CODE_SNIPPET_COPIED = "CODE_SNIPPET_COPIED",
	CODE_SNIPPET_TAB_CHANGED = "CODE_SNIPPET_TAB_CHANGED",
	OPEN_IN_GITHUB_BUTTON_CLICKED = "OPEN_IN_GITHUB_BUTTON_CLICKED",
	SETUP_CLICKED = "SETUP_CLICKED",
	SETUP_COPIED = "SETUP_COPIED",
	CLEANUP_CLICKED = "CLEANUP_CLICKED",

	// Map
	MAP_STYLE_CHANGE = "MAP_STYLE_CHANGE",
	MAP_PROVIDER_CHANGE = "MAP_PROVIDER_CHANGE",
	PLACE_SEARCH = "PLACES_SEARCH",
	ROUTE_SEARCH = "ROUTE_SEARCH",
	ROUTE_OPTION_CHANGED = "ROUTE_OPTION_CHANGED",

	MAP_UNIT_CHANGE = "MAP_UNIT_CHANGE",

	// User
	SIGN_IN_STARTED = "SIGN_IN_STARTED",
	SIGN_IN_SUCCESSFUL = "_userauth.sign_in",
	SIGN_IN_FAILED = "_userauth.auth_fail",
	SIGN_OUT_SUCCESSFUL = "SIGN_OUT_SUCCESSFUL",
	SIGN_OUT_FAILED = "SIGN_OUT_FAILED",
	AWS_ACCOUNT_CONNECTION_STARTED = "AWS_ACCOUNT_CONNECTION_STARTED",
	AWS_ACCOUNT_CONNECTION_SUCCESSFUL = "AWS_ACCOUNT_CONNECTION_SUCCESSFUL",
	AWS_ACCOUNT_CONNECTION_FAILED = "AWS_ACCOUNT_CONNECTION_FAILED",
	AWS_ACCOUNT_CONNECTION_STOPPED = "AWS_ACCOUNT_CONNECTION_STOPPED",

	// Tracker and Geofence
	GEOFENCE_CREATION_STARTED = "GEOFENCE_CREATION_STARTED",
	GEOFENCE_CREATION_SUCCESSFUL = "GEOFENCE_CREATION_SUCCESSFUL",
	GEOFENCE_CREATION_FAILED = "GEOFENCE_CREATION_FAILED",
	GEOFENCE_DELETION_SUCCESSFUL = "GEOFENCE_DELETION_SUCCESSFUL",
	GEOFENCE_DELETION_FAILED = "GEOFENCE_DELETION_FAILED",
	GET_GEOFENCES_LIST_SUCCESSFUL = "GET_GEOFENCES_LIST_SUCCESSFUL",
	GET_GEOFENCES_LIST_FAILED = "GET_GEOFENCES_LIST_FAILED",
	GEO_EVENT_TRIGGERED = "GEO_EVENT_TRIGGERED",
	GEOFENCE_ITEM_SELECTED = "GEOFENCE_ITEM_SELECTED",
	TRACKER_SAVED = "TRACKER_SAVED",

	// General
	CONTINUE_TO_DEMO_CLICKED = "CONTINUE_TO_DEMO_CLICKED",
	LANGUAGE_CHANGED = "LANGUAGE_CHANGED",
	HELP_SEARCH = "HELP_SEARCH"
}

export enum AnalyticsSessionStatus {
	CREATED = "CREATED",
	NOT_CREATED = "NOT_CREATED",
	IN_PROGRESS = "IN_PROGRESS"
}

export enum TriggeredByEnum {
	ROUTE_MODULE = "ROUTE_MODULE",
	TRACKER_SIMULATION_MODULE = "TRACKER_SIMULATION_MODULE",
	PLACES_POPUP = "PLACES_POPUP",
	DEMO_PAGE = "DEMO_PAGE",
	SETTINGS_MODAL = "SETTINGS_MODAL",
	GEOFENCE_MODULE = "GEOFENCE_MODULE",
	PLACES_SEARCH = "PLACES_SEARCH",
	CONNECT_AWS_ACCOUNT_MODAL = "CONNECT_AWS_ACCOUNT_MODAL",
	SIGN_IN_MODAL = "SIGN_IN_MODAL",
	MAP_BUTTONS = "MAP_BUTTONS",
	SIDEBAR = "SIDEBAR",
	UNAUTH_SIMULATION_MODULE = "UNAUTH_SIMULATION_MODULE",
	FOOTER = "FOOTER"
}

export enum TravelMode {
	CAR = "Car",
	WALKING = "Walking",
	TRUCK = "Truck",
	BICYCLE = "Bicycle",
	MOTORCYCLE = "Motorcycle"
}

export enum InputType {
	FROM = "from",
	TO = "to"
}

export enum AnalyticsEventActionsEnum {
	AUTOCOMPLETE = "Autocomplete",
	FROM_SEARCH_AUTOCOMPLETE = "From search autocomplete",
	TO_SEARCH_AUTOCOMPLETE = "To search autocomplete",
	FROM_SUGGESTION_SELECT = "From suggestion select",
	TO_SUGGESTION_SELECT = "To suggestion select",
	SEARCH_ICON_CLICK = "Search icon click",
	SUGGESTION_SELECTED = "Suggestion selected",
	ENTER_BUTTON = "Enter button",

	MODAL_CLOSED = "MODAL_CLOSED",
	TAB_CHANGED = "TAB_CHANGED",
	LOCKED_ITEM_CLICKED = "LOCKED_ITEM_CLICKED",
	CONNECT_AWS_ACCOUNT_BUTTON_CLICKED = "CONNECT_AWS_ACCOUNT_BUTTON_CLICKED"
}

export enum LocationErrorMessage {
	DENIED = "Permission denied, please enable browser location and refresh the page",
	UNAVAILABLE = "Permission unavailable, please check that your location services are enabled.",
	TIMEOUT = "Timeout, please try again"
}

export enum ToastType {
	INFO = "info",
	SUCCESS = "success",
	WARNING = "warning",
	ERROR = "error"
}

export enum MapUnitEnum {
	IMPERIAL = "Imperial",
	METRIC = "Metric"
}

export enum DistanceUnitEnum {
	MILES = "Miles",
	MILES_SHORT = "mi",
	FEET = "Feet",
	FEET_SHORT = "ft",
	KILOMETERS = "Kilometers",
	KILOMETERS_SHORT = "km",
	METERS = "Meters",
	METERS_SHORT = "m"
}

export enum MapProviderEnum {
	ESRI = "Esri",
	HERE = "HERE",
	GRAB = "Grab",
	OPEN_DATA = "OpenData"
}

export enum EsriMapEnum {
	ESRI_DARK_GRAY_CANVAS = "location.aws.com.demo.maps.Esri.DarkGrayCanvas",
	ESRI_IMAGERY = "location.aws.com.demo.maps.Esri.Imagery",
	ESRI_LIGHT = "location.aws.com.demo.maps.Esri.Light",
	ESRI_LIGHT_GRAY_CANVAS = "location.aws.com.demo.maps.Esri.LightGrayCanvas",
	ESRI_NAVIGATION = "location.aws.com.demo.maps.Esri.Navigation",
	ESRI_STREET_MAP = "location.aws.com.demo.maps.Esri.Streets"
}

export enum EsriMapStyleEnum {
	"location.aws.com.demo.maps.Esri.DarkGrayCanvas" = "VectorEsriDarkGrayCanvas",
	"location.aws.com.demo.maps.Esri.Imagery" = "RasterEsriImagery",
	"location.aws.com.demo.maps.Esri.Light" = "VectorEsriTopographic",
	"location.aws.com.demo.maps.Esri.LightGrayCanvas" = "VectorEsriLightGrayCanvas",
	"location.aws.com.demo.maps.Esri.Navigation" = "VectorEsriNavigation",
	"location.aws.com.demo.maps.Esri.Streets" = "VectorEsriStreets"
}

export enum HereMapEnum {
	HERE_EXPLORE = "location.aws.com.demo.maps.HERE.Explore",
	HERE_CONTRAST = "location.aws.com.demo.maps.HERE.Contrast",
	HERE_EXPLORE_TRUCK = "location.aws.com.demo.maps.HERE.ExploreTruck",
	HERE_HYBRID = "location.aws.com.demo.maps.HERE.Hybrid",
	HERE_IMAGERY = "location.aws.com.demo.maps.HERE.Imagery"
}

export enum HereMapStyleEnum {
	"location.aws.com.demo.maps.HERE.Explore" = "VectorHereExplore",
	"location.aws.com.demo.maps.HERE.Contrast" = "VectorHereContrast",
	"location.aws.com.demo.maps.HERE.ExploreTruck" = "VectorHereExploreTruck",
	"location.aws.com.demo.maps.HERE.Hybrid" = "HybridHereExploreSatellite",
	"location.aws.com.demo.maps.HERE.Imagery" = "RasterHereExploreSatellite"
}

export enum GrabMapEnum {
	GRAB_STANDARD_LIGHT = "location.aws.com.demo.maps.Grab.StandardLight",
	GRAB_STANDARD_DARK = "location.aws.com.demo.maps.Grab.StandardDark"
}

export enum GrabMapStyleEnum {
	"location.aws.com.demo.maps.Grab.StandardLight" = "VectorGrabStandardLight",
	"location.aws.com.demo.maps.Grab.StandardDark" = "VectorGrabStandardDark"
}

export enum OpenDataMapEnum {
	OPEN_DATA_STANDARD_LIGHT = "location.aws.com.demo.maps.OpenData.StandardLight",
	OPEN_DATA_STANDARD_DARK = "location.aws.com.demo.maps.OpenData.StandardDark",
	OPEN_DATA_VISUALIZATION_LIGHT = "location.aws.com.demo.maps.OpenData.VisualizationLight",
	OPEN_DATA_VISUALIZATION_DARK = "location.aws.com.demo.maps.OpenData.VisualizationDark"
}

export enum OpenDataMapStyleEnum {
	"location.aws.com.demo.maps.OpenData.StandardLight" = "VectorOpenDataStandardLight",
	"location.aws.com.demo.maps.OpenData.StandardDark" = "VectorOpenDataStandardDark",
	"location.aws.com.demo.maps.OpenData.VisualizationLight" = "VectorOpenDataVisualizationLight",
	"location.aws.com.demo.maps.OpenData.VisualizationDark" = "VectorOpenDataVisualizationDark"
}

export enum CirclreDrawTypeEnum {
	DRAW_CREATE = "draw.create",
	DRAW_UPDATE = "draw.update"
}

export enum SettingOptionEnum {
	UNITS = "Units",
	DATA_PROVIDER = "Data provider",
	MAP_STYLE = "Map style",
	LANGUAGE = "Language",
	ROUTE_OPTIONS = "Default route options",
	REGION = "Region",
	AWS_CLOUD_FORMATION = "Connect AWS Account"
}

export enum AboutOptionEnum {
	ATTRIBUTION = "Attribution",
	LEGAL_AND_PRIVACY = "Legal and Privacy",
	VERSION = "Version",
	TERMS_AND_CONDITIONS = "Terms and Conditions"
}

export enum RadiusInM {
	DEFAULT = 80,
	MIN = 10,
	MAX = 10000
}

export enum TrackerType {
	CAR = "Car",
	WALK = "Walk",
	DRONE = "Drone"
}

export enum HelpAccordionEnum {
	CREATE = "Creation",
	DELETE = "Deletion",
	TROUBLESHOOT = "Troubleshooting"
}

export enum UserAgentEnum {
	IOS = "IOS",
	ANDROID = "Android"
}

export enum AttributeEnum {
	Light = "Light",
	Dark = "Dark",
	Satellite = "Satellite",
	ThreeD = "3D",
	Truck = "Truck"
}

export enum TypeEnum {
	Vector = "Vector",
	Raster = "Raster"
}

export enum MenuItemEnum {
	GEOFENCE = "Geofence",
	TRACKER = "Tracker"
}

export enum TrackingHistoryTypeEnum {
	TRACKER = "tracker",
	BUS_STOP = "bus_stop"
}

export enum RegionEnum {
	US_EAST_1 = "us-east-1",
	EU_WEST_1 = "eu-west-1",
	AP_SOUTHEAST_1 = "ap-southeast-1"
}

export enum ResponsiveUIEnum {
	explore = "explore",
	search = "search",
	map_styles = "map_styles",
	poi_card = "poi_card",
	routes = "routes",
	trackers = "trackers",
	geofences = "geofences"
}
