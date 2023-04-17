# Amazon Location Web Demo

## Requirements

1. This project is developed using Node v14.19.2
2. Run the [CF template](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create?stackName=amazon-location-resources-setup&templateURL=https://amazon-location-demo-resources.s3.amazonaws.com/location-services.yaml) using your own AWS account and get `IdentityPoolId` and `region` from stack output
3. Keys mentioned above will be added to `.env` file, which is required to get the project running

#### Env keys required in `.env` file, see `.env.example` for reference

> VITE_AWS_COGNITO_IDENTITY_POOL_ID=<VITE_AWS_COGNITO_IDENTITY_POOL_ID><br />
VITE_AWS_REGION=<VITE_AWS_REGION><br />
VITE_AWS_CF_TEMPLATE=<VITE_AWS_CF_TEMPLATE><br />
VITE_APPLE_APP_STORE_LINK=<VITE_APPLE_APP_STORE_LINK><br />
VITE_GOOGLE_PLAY_STORE_LINK=<VITE_GOOGLE_PLAY_STORE_LINK><br />

## Configure

> git clone https://github.com/makeen-project/amazon-location-web-demo.git<br />
cd amazon-location-web-demo/<br />
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

#### `yarn cypress run`

Runs Cypress tests to completion. By default, `cypress run` will run all tests headlessly. https://docs.cypress.io/guides/guides/command-line#cypress-run

#### `yarn cypress open`

Runs Cypress tests to completion in a browser which can be specified in the `options`. https://docs.cypress.io/guides/guides/command-line#cypress-open

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

## Contribute

- Have a bug to report? [Open an issue](https://github.com/makeen-project/amazon-location-web-demo/issues). If possible, include details about your development environment, and an example that shows the issue.
- Have a feature enhancement? [Open a PR](https://github.com/makeen-project/amazon-location-web-demo/pulls). Tell us what the PR accomplishes and describe it to the best of your knowledge.

## Licensing

- This project is licensed under the MIT-0 License. See [LICENSE](https://github.com/aws-samples/amazon-location-samples/blob/main/LICENSE).
