/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const busRoutesData = [
	{
		id: "bus_route_01",
		name: "Bus 01 Robson",
		geofenceCollection: "BusStopsCollection01",
		coordinates: [
			[-123.113277, 49.279321],
			[-123.110118, 49.281467],
			[-123.110066, 49.281561],
			[-123.110956, 49.282119],
			[-123.111922, 49.282763],
			[-123.112864, 49.283416],
			[-123.117889, 49.286556],
			[-123.119392, 49.285601],
			[-123.120017, 49.285153],
			[-123.121665, 49.284014],
			[-123.122804, 49.283281],
			[-123.124848, 49.284599],
			[-123.129948, 49.287918],
			[-123.131119, 49.288661],
			[-123.13388, 49.290468],
			[-123.135476, 49.291479],
			[-123.136527, 49.290778],
			[-123.137549, 49.290071],
			[-123.139697, 49.288673],
			[-123.141822, 49.28727],
			[-123.140236, 49.286242]
		],
		stopCoordinates: [
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.11137, 49.282472]
				},
				properties: {
					id: 549621074,
					stop_id: "11638",
					stop_name: "Westbound W Pender St @ Hamilton St"
				},
				id: 549621074
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.116055, 49.285523]
				},
				properties: {
					id: 549628619,
					stop_id: "97",
					stop_name: "Westbound W Pender St @ Howe St"
				},
				id: 549628619
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.120503, 49.284688]
				},
				properties: {
					id: 549623502,
					stop_id: "31",
					stop_name: "Burrard Station @ Bay 7"
				},
				id: 549623502
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.129709, 49.287679]
				},
				properties: {
					id: 549621912,
					stop_id: "12732",
					stop_name: "Eastbound Robson St @ Broughton St"
				},
				id: 549621912
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.137908, 49.289924]
				},
				properties: {
					id: 549626288,
					stop_id: "636",
					stop_name: "Southbound Denman St @ Barclay St"
				},
				id: 549626288
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.141124, 49.286705]
				},
				properties: {
					id: 549626316,
					stop_id: "639",
					stop_name: "Eastbound Davie St @ Denman St"
				},
				id: 549626316
			}
		]
	},
	{
		id: "bus_route_02",
		name: "Bus 02 Davie",
		geofenceCollection: "BusStopsCollection02",
		coordinates: [
			[-123.141822, 49.28727],
			[-123.137481, 49.284453],
			[-123.136304, 49.283712],
			[-123.133353, 49.281806],
			[-123.131214, 49.280383],
			[-123.126192, 49.277155],
			[-123.123274, 49.275247],
			[-123.122665, 49.274872],
			[-123.122137, 49.274525],
			[-123.121567, 49.274176],
			[-123.121488, 49.274088],
			[-123.121333, 49.273981],
			[-123.120348, 49.274247],
			[-123.120169, 49.27434],
			[-123.119316, 49.274534],
			[-123.119203, 49.274619],
			[-123.11812, 49.275974],
			[-123.117936, 49.276103],
			[-123.117902, 49.276212],
			[-123.116625, 49.277111],
			[-123.116587, 49.277168],
			[-123.114963, 49.27821],
			[-123.113277, 49.279321],
			[-123.111557, 49.280488]
		],
		stopCoordinates: [
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.13847, 49.285009]
				},
				properties: {
					id: 549626319,
					stop_id: "640",
					stop_name: "Eastbound Davie St @ Cardero St"
				},
				id: 549626319
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.131638, 49.280756]
				},
				properties: {
					id: 549624994,
					stop_id: "49",
					stop_name: "Westbound Davie St @ Thurlow St"
				},
				id: 549624994
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.121876, 49.274278]
				},
				properties: {
					id: 549620860,
					stop_id: "11311",
					stop_name: "Yaletown-Roundhouse Station @ Bay 2"
				},
				id: 549620860
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.115404, 49.277999]
				},
				properties: {
					id: 549620674,
					stop_id: "11119",
					stop_name: "Southbound Cambie St @ Robson St"
				},
				id: 549620674
			}
		]
	},
	{
		id: "bus_route_03",
		name: "Bus 03 Victoria",
		geofenceCollection: "BusStopsCollection03",
		coordinates: [
			[-123.069675, 49.269587],
			[-123.069559, 49.273952],
			[-123.069532, 49.275761],
			[-123.06947, 49.276656],
			[-123.06946, 49.276915],
			[-123.069522, 49.277077],
			[-123.069679, 49.277247],
			[-123.070071, 49.277572],
			[-123.070282, 49.277776],
			[-123.070472, 49.278098],
			[-123.070471, 49.278482],
			[-123.070451, 49.27938],
			[-123.070399, 49.281248],
			[-123.07263, 49.281293],
			[-123.078055, 49.281357],
			[-123.078568, 49.281274],
			[-123.07916, 49.281115],
			[-123.079643, 49.281012],
			[-123.080061, 49.280986],
			[-123.081305, 49.280967],
			[-123.087162, 49.281092],
			[-123.089531, 49.281164],
			[-123.097466, 49.281313],
			[-123.099687, 49.281347],
			[-123.103853, 49.281433],
			[-123.104327, 49.281474],
			[-123.107193, 49.282001],
			[-123.109418, 49.282437],
			[-123.109961, 49.282772],
			[-123.111908, 49.284047],
			[-123.116191, 49.281213]
		],
		stopCoordinates: [
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.069418, 49.275134]
				},
				properties: {
					id: 549621641,
					stop_id: "1238",
					stop_name: "Northbound Commercial Dr @ Napier St"
				},
				id: 549621641
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.071174, 49.281362]
				},
				properties: {
					id: 549625100,
					stop_id: "503",
					stop_name: "Westbound E Hastings St @ Commercial Dr"
				},
				id: 549625100
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.093904, 49.281321]
				},
				properties: {
					id: 549625168,
					stop_id: "510",
					stop_name: "Westbound E Hastings St @ Jackson Ave"
				},
				id: 549625168
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.110279, 49.283085]
				},
				properties: {
					id: 549622553,
					stop_id: "188",
					stop_name: "Westbound W Hastings St @ Hamilton St"
				},
				id: 549622553
			}
		]
	},
	{
		id: "bus_route_04",
		name: "Bus 04 Knight",
		geofenceCollection: "BusStopsCollection04",
		coordinates: [
			[-123.096963, 49.277617],
			[-123.096879, 49.276696],
			[-123.096626, 49.276668],
			[-123.096279, 49.276659],
			[-123.096153, 49.2767],
			[-123.093627, 49.276673],
			[-123.084998, 49.276493],
			[-123.084485, 49.276506],
			[-123.084012, 49.276595],
			[-123.083233, 49.276806],
			[-123.082856, 49.276837],
			[-123.079984, 49.276801],
			[-123.079305, 49.276813],
			[-123.078601, 49.276781],
			[-123.077265, 49.27676],
			[-123.077288, 49.275855],
			[-123.077299, 49.27404],
			[-123.077365, 49.269649],
			[-123.077385, 49.268754],
			[-123.07738, 49.267849],
			[-123.077408, 49.266925],
			[-123.077429, 49.265175],
			[-123.077487, 49.264234],
			[-123.077528, 49.263332],
			[-123.077547, 49.262579],
			[-123.077619, 49.262485],
			[-123.077623, 49.262393]
		],
		stopCoordinates: [
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.07825, 49.276697]
				},
				properties: {
					id: 549622045,
					stop_id: "1294",
					stop_name: "Eastbound Venables St @ Vernon Dr"
				},
				id: 549622045
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.087659, 49.276481]
				},
				properties: {
					id: 549622035,
					stop_id: "1291",
					stop_name: "Eastbound Prior St @ Hawks Ave"
				},
				id: 549622035
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.077367, 49.262754]
				},
				properties: {
					id: 549622109,
					stop_id: "1361",
					stop_name: "Northbound Clark Dr @ E Broadway"
				},
				id: 549622109
			}
		]
	},
	{
		id: "bus_route_05",
		name: "Bus 05 UBC",
		geofenceCollection: "BusStopsCollection05",
		coordinates: [
			[-123.111852, 49.285326],
			[-123.114583, 49.287068],
			[-123.116194, 49.287664],
			[-123.11696, 49.287174],
			[-123.117889, 49.286556],
			[-123.119392, 49.285601],
			[-123.120017, 49.285153],
			[-123.121665, 49.284014],
			[-123.122804, 49.283282],
			[-123.124422, 49.282225],
			[-123.126038, 49.281195],
			[-123.127079, 49.280479],
			[-123.129182, 49.279077],
			[-123.130786, 49.278037],
			[-123.132228, 49.277089],
			[-123.13234, 49.277061],
			[-123.132653, 49.276903],
			[-123.133215, 49.276722],
			[-123.134217, 49.276384],
			[-123.144191, 49.273176],
			[-123.145065, 49.272848],
			[-123.145319, 49.272662],
			[-123.145393, 49.272537],
			[-123.145516, 49.272299],
			[-123.145464, 49.271648],
			[-123.145484, 49.270666],
			[-123.145561, 49.269783],
			[-123.145594, 49.2689],
			[-123.14564, 49.268005],
			[-123.157502, 49.268187],
			[-123.159845, 49.26825],
			[-123.164539, 49.268326]
		],
		stopCoordinates: [
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.120503, 49.284688]
				},
				properties: {
					id: 549623502,
					stop_id: "31",
					stop_name: "Burrard Station @ Bay 7"
				},
				id: 549623502
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.130164, 49.278573]
				},
				properties: {
					id: 549621014,
					stop_id: "11563",
					stop_name: "Southbound Burrard St @ Burnaby St"
				},
				id: 549621014
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.145798, 49.268549]
				},
				properties: {
					id: 549622581,
					stop_id: "1959",
					stop_name: "Southbound Burrard St @ W 3rd Ave"
				},
				id: 549622581
			},
			{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [-123.155847, 49.268242]
				},
				properties: {
					id: 549621956,
					stop_id: "12815",
					stop_name: "Westbound W 4th Ave @ Yew St"
				},
				id: 549621956
			}
		]
	}
];

export default busRoutesData;
