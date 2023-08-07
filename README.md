# Amazon Location Features Demo Web

## Requirements

1. Run the [CF template](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create?stackName=amazon-location-resources-setup&templateURL=https://amazon-location-resources-setup.s3.amazonaws.com/location-services.yaml) or run the CF template from  `/extra/cloudformation/default-resources-template.yaml` on AWS in `us-east-1` region, using your own AWS account and get `IdentityPoolId` from stack output.
2. Values from above stack output will be added to `.env` file against `VITE_AWS_COGNITO_IDENTITY_POOL_IDS`.
3. Run the CF template from  `/extra/cloudformation/default-grab-resources-template.yaml` on AWS in `ap-southeast-1` region, using your own AWS account and get `IdentityPoolId` from stack output.
4. Values from above stack output will be added to `.env` file against `VITE_AWS_COGNITO_IDENTITY_POOL_IDS`.
5. Upload the CF template from `/extra/cloudformation/main-cf-template.yaml` to the same region as step 1 (`us-east-1`) and add the link to the key `VITE_AWS_CF_TEMPLATE` in `.env` file.
6. Add the keys `VITE_APPLE_APP_STORE_LINK` and `VITE_GOOGLE_PLAY_STORE_LINK` in `.env` file with the links pointing to respective stores.

#### Env keys required in `.env` file, see `.env.example` for reference

> VITE_AWS_COGNITO_IDENTITY_POOL_IDS<br />
VITE_AWS_WEB_SOCKET_URL<br />
VITE_PINPOINT_IDENTITY_POOL_ID<br />
VITE_PINPOINT_APPLICATION_ID<br />
VITE_AWS_CF_TEMPLATE<br />
VITE_APPLE_APP_STORE_LINK<br />
VITE_GOOGLE_PLAY_STORE_LINK<br />
VITE_COUNTRY_EVALUATION_URL<br />
## Configure

> git clone <REPO_URL><br />
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

>WEB_DOMAIN<br />
WEB_DOMAIN_USERNAME<br />
WEB_DOMAIN_PASSWORD<br />
IDENTITY_POOL_ID<br />
USER_DOMAIN<br />
USER_POOL_CLIENT_ID<br />
USER_POOL_ID<br />
WEB_SOCKET_URL<br />
COGNITO_EMAIL<br />
COGNITO_PASSWORD<br />

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
- location.aws.com.demo.maps.Grab.StandardLight - VectorGrabStandardLight
- location.aws.com.demo.maps.Grab.StandardDark - VectorGrabStandardDark

> Place indexes (Name)

- location.aws.com.demo.places.Esri.PlaceIndex
- location.aws.com.demo.places.HERE.PlaceIndex
- location.aws.com.demo.places.Grab.PlaceIndex

> Route calculators (Name)

- location.aws.com.demo.routes.Esri.RouteCalculator
- location.aws.com.demo.routes.HERE.RouteCalculator
- location.aws.com.demo.routes.Grab.RouteCalculator

> Geofence collections (Name)

- location.aws.com.demo.geofences.GeofenceCollection

> Trackers (Name)

- location.aws.com.demo.trackers.Tracker

## Licensing

- This project is licensed under the MIT-0 License. See [LICENSE](https://github.com/aws-samples/amazon-location-samples/blob/main/LICENSE).
