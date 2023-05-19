# Amazon Location Web Demo

## Requirements

1. This project is developed using Node v14.19.2
2. Run the [CF template](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create?stackName=amazon-location-resources-setup&templateURL=https://amazon-location-demo-resources.s3.amazonaws.com/location-services.yaml) using your own AWS account and get `IdentityPoolId` and `region` from stack output
3. Keys mentioned above will be added to `.env` file, which is required to get the project running

#### Env keys required in `.env` file, see `.env.example` for reference

> VITE_AWS_COGNITO_IDENTITY_POOL_ID=<VITE_AWS_COGNITO_IDENTITY_POOL_ID><br />
VITE_AWS_REGION=<VITE_AWS_REGION><br />
>VITE_AWS_COGNITO_IDENTITY_POOL_ID_ASIA=<VITE_AWS_COGNITO_IDENTITY_POOL_ID_ASIA><br />
VITE_AWS_REGION_ASIA=<VITE_AWS_REGION_ASIA><br />
VITE_AWS_CF_TEMPLATE=<VITE_AWS_CF_TEMPLATE><br />
VITE_APPLE_APP_STORE_LINK=<VITE_APPLE_APP_STORE_LINK><br />
VITE_GOOGLE_PLAY_STORE_LINK=<VITE_GOOGLE_PLAY_STORE_LINK><br />

## Configure

> git clone https://github.com/aws-geospatial/amazon-location-features-demo-web.git<br />
cd amazon-location-features-demo-web/<br />
yarn install<br />
yarn vite

#### `yarn install`
Installs all the dependencies.

#### `yarn vite`
Runs the app in the **development mode**.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### `yarn run build && npx http-server ./build -p 8080`
Builds the app for **development** to the `build` folder locally and starts the local server.

## E2E Tests
#### Env keys required in `cypress.env.json` file, see `cypress.env.json.example` for reference. This is only needed to run the e2e tests locally.
>WEB_DOMAIN=<WEB_DOMAIN><br />
WEB_DOMAIN_USERNAME=<WEB_DOMAIN_USERNAME><br />
WEB_DOMAIN_PASSWORD=<WEB_DOMAIN_PASSWORD><br />
IDENTITY_POOL_ID=<IDENTITY_POOL_ID><br />
USER_DOMAIN=<USER_DOMAIN><br />
USER_POOL_CLIENT_ID=<USER_POOL_CLIENT_ID><br />
USER_POOL_ID=<USER_POOL_ID><br />
WEB_SOCKET_URL=<WEB_SOCKET_URL><br />
COGNITO_EMAIL=<COGNITO_EMAIL><br />
COGNITO_PASSWORD=<COGNITO_PASSWORD><br />

#### If you are configuring Github actions fo the e2e tests, make sure to add these keys to the secrets section of the repo with a `CYPRESS_` prefix.

#### `yarn cypress run`
Runs Cypress tests to completion. By default, `cypress run` will run all tests headlessly. https://docs.cypress.io/guides/guides/command-line#cypress-run

#### `yarn cypress open`
Runs Cypress tests to completion in a browser which can be specified in the `options`. https://docs.cypress.io/guides/guides/command-line#cypress-open

## Security Tests
#### `yarn run-security-tests`
Runs Security tests insuring policies match the expected values.

## Unit Tests
#### `yarn test`
Run all the test cases for all the components within the repo.

#### `yarn coverage`
Run all the test cases for all the components within the repo and provides a coverage report.

## Resources
### Amazon Location Service
> Maps (Name - Style)

- location.aws.com.demo.maps.Esri.DarkGrayCanvas - VectorEsriDarkGrayCanvas
- location.aws.com.demo.maps.Esri.Imagery - RasterEsriImagery
- location.aws.com.demo.maps.Esri.Light - VectorEsriTopographic
- location.aws.com.demo.maps.Esri.LightGrayCanvas - VectorEsriLightGrayCanvas
- location.aws.com.demo.maps.Esri.Navigation - VectorEsriNavigation
- location.aws.com.demo.maps.Esri.Streets - VectorEsriStreets
- location.aws.com.demo.maps.HERE.Explore - VectorHereExplore
- location.aws.com.demo.maps.HERE.Contrast - VectorHereContrast
- location.aws.com.demo.maps.HERE.ExploreTruck - VectorHereExploreTruck
- location.aws.com.demo.maps.HERE.Hybrid - HybridHereExploreSatellite
- location.aws.com.demo.maps.HERE.Imagery - RasterHereExploreSatellite

> Place indexes (Name)
- location.aws.com.demo.places.Esri.PlaceIndex
- location.aws.com.demo.places.HERE.PlaceIndex

> Route calculators (Name)
- location.aws.com.demo.routes.Esri.RouteCalculator
- location.aws.com.demo.routes.HERE.RouteCalculator

> Geofence collections (Name)
- location.aws.com.demo.geofences.GeofenceCollection

> Trackers (Name)
- location.aws.com.demo.trackers.Tracker

## Licensing
- This project is licensed under the MIT-0 License. See [LICENSE](https://github.com/aws-samples/amazon-location-samples/blob/main/LICENSE).
