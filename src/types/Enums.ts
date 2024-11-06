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
	SIGN_OUT_STARTED = "SIGN_OUT_STARTED",
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

export enum AnalyticsPlaceSearchTypeEnum {
	COORDINATES = "Coordinates",
	NATURAL_LANGUAGE_TEXT = "NaturalLanguageText",
	TEXT = "Text"
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
	PEDESTRIAN = "Pedestrian",
	SCOOTER = "Scooter",
	TRUCK = "Truck"
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
	CONNECT_AWS_ACCOUNT_BUTTON_CLICKED = "CONNECT_AWS_ACCOUNT_BUTTON_CLICKED",
	CONNECT_AWS_FEEDBACK_BUTTON_CLICKED = "CONNECT_AWS_FEEDBACK_BUTTON_CLICKED"
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

export enum CirclreDrawTypeEnum {
	DRAW_CREATE = "draw.create",
	DRAW_UPDATE = "draw.update"
}

export enum SettingOptionEnum {
	UNITS = "Units",
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
	PEDESTRIAN = "Pedestrian",
	DRONE = "Drone",
	MOBILE = "Mobile"
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
	before_start_unauthorized_tracker = "before_start_unauthorized_tracker",
	before_start_unauthorized_geofence = "before_start_unauthorized_geofence",
	non_start_unauthorized_tracker = "non_start_unauthorized_tracker",
	non_start_unauthorized_geofence = "non_start_unauthorized_geofence",
	exit_unauthorized_tracker = "exit_unauthorized_tracker",
	exit_unauthorized_geofence = "exit_unauthorized_geofence",
	unauth_tracker = "unauth_tracker",
	auth_tracker = "auth_tracker",
	auth_geofence = "auth_geofence",
	unauth_geofence = "unauth_geofence",
	direction_to_routes = "direction_to_routes"
}

export enum MqttConnectionState {
	CLOSED = "closed",
	CONNECT = "connect",
	CONNECTION_FAILURE = "connection_failure",
	CONNECTION_SUCCESS = "connection_success",
	DISCONNECT = "disconnect",
	ERROR = "error",
	INTERRUPT = "interrupt",
	RESUME = "resume"
}

export enum MapStyleEnum {
	STANDARD = "Standard",
	MONOCHROME = "Monochrome",
	HYBRID = "Hybrid",
	SATELLITE = "Satellite"
}

export enum MapColorSchemeEnum {
	LIGHT = "Light",
	DARK = "Dark"
}
