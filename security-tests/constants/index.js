import * as dotenv from "dotenv";

dotenv.config();

const region = process.env.VITE_AWS_REGION_TEST;

export const policies = {
	AUTH: {
		Version: "2012-10-17",
		Statement: [
			{
				Action: [
					"geo:GetPlace",
					"geo:SearchPlaceIndex*",
					"geo:GetMap*",
					"geo:CalculateRoute",
					"geo:ListGeofences",
					"geo:GetGeofence",
					"geo:BatchPutGeofence",
					"geo:BatchEvaluateGeofences",
					"geo:PutGeofence",
					"geo:BatchDeleteGeofence",
					"geo:GetDevicePosition*",
					"geo:ListDevicePositions",
					"geo:BatchDeleteDevicePositionHistory",
					"geo:BatchGetDevicePosition",
					"geo:BatchUpdateDevicePosition",
					"iot:Subscribe",
					"iot:Publish",
					"iot:Connect",
					"iot:Receive",
					"iam:ListRolePolicies",
					"iam:GetRolePolicy"
				],
				Resource: [
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Light`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.DarkGrayCanvas`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Imagery`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.LightGrayCanvas`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Navigation`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Streets`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Explore`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Contrast`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.ExploreTruck`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Hybrid`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Imagery`,
					`arn:aws:geo:${region}:XXXXXX:place-index/location.aws.com.demo.places.Esri.PlaceIndex`,
					`arn:aws:geo:${region}:XXXXXX:place-index/location.aws.com.demo.places.HERE.PlaceIndex`,
					`arn:aws:geo:${region}:XXXXXX:route-calculator/location.aws.com.demo.routes.Esri.RouteCalculator`,
					`arn:aws:geo:${region}:XXXXXX:route-calculator/location.aws.com.demo.routes.HERE.RouteCalculator`,
					`arn:aws:geo:${region}:XXXXXX:geofence-collection/location.aws.com.demo.geofences.GeofenceCollection`,
					`arn:aws:geo:${region}:XXXXXX:tracker/location.aws.com.demo.trackers.Tracker`,
					`arn:aws:iot:${region}:XXXXXX:client/XXXXXX`,
					`arn:aws:iot:${region}:XXXXXX:topic/XXXXXX`,
					`arn:aws:iot:${region}:XXXXXX:topicfilter/XXXXXX/*`,
					"arn:aws:iot:${region}:XXXXXX:topic/XXXXXX/tracker",
					"arn:aws:iam::XXXXXX:role/amazon-location-resources-AmazonLocationDemoCognit-XXXXXX",
					"arn:aws:iam::XXXXXX:role/amazon-location-resources-AmazonLocationDemoCognit-XXXXXX"
				],
				Effect: "Allow"
			},
			{
				Condition: {
					StringEquals: {
						"cognito-identity.amazonaws.com:sub": "${cognito-identity.amazonaws.com:sub}"
					}
				},
				Action: ["iot:AttachPolicy", "iot:DetachPolicy", "iot:AttachPrincipalPolicy", "iot:DetachPrincipalPolicy"],
				Resource: ["*"],
				Effect: "Allow"
			}
		]
	},
	UNAUTH: {
		Version: "2012-10-17",
		Statement: [
			{
				Action: ["geo:GetPlace", "geo:SearchPlaceIndex*", "geo:GetMap*", "geo:CalculateRoute"],
				Resource: [
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Light`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.DarkGrayCanvas`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Imagery`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.LightGrayCanvas`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Navigation`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.Esri.Streets`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Explore`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Contrast`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.ExploreTruck`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Hybrid`,
					`arn:aws:geo:${region}:XXXXXX:map/location.aws.com.demo.maps.HERE.Imagery`,
					`arn:aws:geo:${region}:XXXXXX:place-index/location.aws.com.demo.places.Esri.PlaceIndex`,
					`arn:aws:geo:${region}:XXXXXX:place-index/location.aws.com.demo.places.HERE.PlaceIndex`,
					`arn:aws:geo:${region}:XXXXXX:route-calculator/location.aws.com.demo.routes.Esri.RouteCalculator`,
					`arn:aws:geo:${region}:XXXXXX:route-calculator/location.aws.com.demo.routes.HERE.RouteCalculator`
				],
				Effect: "Allow"
			}
		]
	}
};
