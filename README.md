# Amazon Location Features Demo Web

## Requirements

1. Run the template from `/extra/cloudformation/unauth-resources.yaml` to create AWS CloudFormation stack in `us-east-1` region and get `Region`, `ApiKey`, `IdentityPoolId`, `PinPointAppId`, `WebSocketUrl` from stack output's tab.
   - `Region` value will be added to `.env` file against `VITE_AWS_API_KEY_REGIONS`.
   - `ApiKey` value will be added to `.env` file against `VITE_AWS_API_KEYS`.
      - In stack output's tab only the ApiKey name is visible, in order to get the ApiKey value
      - Navigate to Amazon Location Service
      - Click on "API keys" from the left navigation pane
      - Click on the ApiKey name
      - Copy the ApiKey value
   - `IdentityPoolId` value will be added to `.env` file against `VITE_AWS_COGNITO_IDENTITY_POOL_IDS` and `VITE_PINPOINT_IDENTITY_POOL_ID`.
   - `PinPointAppId` value will be added to `.env` file against `VITE_PINPOINT_APPLICATION_ID`.
   - `WebSocketUrl` value will be added to `.env` file against `VITE_AWS_WEB_SOCKET_URLS`.
   -  ---
      ***Note***
      * Pinpoint and Translate resosurces are only created in `us-east-1` which are required for the analytics feature and running translation scripts.
      * Make sure to run the above stack in `eu-west-1` as well to support multiple regions.
      * The `Region`, `ApiKey`, `IdentityPoolId`, `WebSocketUrl` values from stack output's tab can be added to `.env` file against the respective keys.
      * The `VITE_AWS_API_KEY_REGIONS`, `VITE_AWS_API_KEYS`, `VITE_AWS_COGNITO_IDENTITY_POOL_IDS`, `VITE_AWS_WEB_SOCKET_URLS` keys in `.env` file should be comma separated for multiple values and must be in same order for all variables.
      ---
2. Upload the CF template from `/extra/cloudformation/auth-resources.yaml` to S3 bucket and add the link with the following prefix `https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create?stackName=amazon-location-resources-setup&templateURL=<LINK_TO_UPLOADED_CF_TEMPLATE>` to the key `VITE_AWS_CF_TEMPLATE` in `.env` file.
3. Value for `VITE_APPLE_APP_STORE_LINK`, `VITE_GOOGLE_PLAY_STORE_LINK` can be added as it is to `.env` file from `.env.examples`.
4. Value for `VITE_APP_VERSION` needs to be populated with the correct version at the time of deployment in the following format `2.1.0`.
5. Values for `VITE_MIGRATE_FROM_GOOGLE_MAPS_PAGE`, `VITE_MIGRATE_A_WEB_APP_PAGE`, `VITE_MIGRATE_AN_ANDROID_APP_PAGE`, `VITE_MIGRATE_AN_IOS_APP_PAGE`, `VITE_MIGRATE_A_WEB_SERVICE_PAGE` and `VITE_PRICING_PAGE` can either be `1` or `0` to either enable or disable the respective pages.
6. Values for `VITE_SHOW_NEW_NAVIGATION` can either be `1` or `0` to either enable or disable the new navigation, turning it off would show the current navigation instead.

#### Env keys required in `.env` file, see `.env.example` for reference

> VITE_AWS_API_KEY_REGIONS<br />
> VITE_AWS_API_KEYS<br />
> VITE_AWS_COGNITO_IDENTITY_POOL_IDS<br />
> VITE_AWS_WEB_SOCKET_URLS<br />
> VITE_PINPOINT_IDENTITY_POOL_ID<br />
> VITE_PINPOINT_APPLICATION_ID<br />
> VITE_AWS_CF_TEMPLATE<br />
> VITE_APPLE_APP_STORE_LINK<br />
> VITE_GOOGLE_PLAY_STORE_LINK<br />
> VITE_APP_VERSION<br />
> VITE_MIGRATE_FROM_GOOGLE_MAPS_PAGE<br />
> VITE_MIGRATE_A_WEB_APP_PAGE<br />
> VITE_MIGRATE_AN_ANDROID_APP_PAGE<br />
> VITE_MIGRATE_AN_IOS_APP_PAGE<br />
> VITE_MIGRATE_A_WEB_SERVICE_PAGE<br />
> VITE_PRICING_PAGE<br />
> VITE_SHOW_NEW_NAVIGATION<br />

#### Env keys optional in `.env` file, see `.env.example` for reference
> VITE_NL_BASE_URL<br />
> VITE_NL_API_KEY<br />

## Configure

> git clone <REPO_URL><br />
> cd amazon-location-features-demo-web/<br />
> npm install<br />
> npm run dev<br />

#### `npm install`

Installs all the dependencies.

#### `npm run dev`

Runs the app in the **development mode**.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## E2E Tests

#### Env keys required in `cypress.env.json` file, see `cypress.env.json.example` for reference.

> WEB_DOMAIN<br />
> IDENTITY_POOL_ID<br />
> USER_DOMAIN<br />
> USER_POOL_CLIENT_ID<br />
> USER_POOL_ID<br />
> WEB_SOCKET_URL<br />
> COGNITO_EMAIL<br />
> COGNITO_PASSWORD<br />
> PINPOINT_IDENTITY_POOL_ID<br />
> PINPOINT_APPLICATION_ID<br />

#### If you are configuring Github actions for the E2E tests, make sure to add the below env keys to the secrets section of the repo.

1. The `/extra/cloudformation/auth-resources.yaml` needs to be deployed on one of the production accounts in the `us-east-1` region.
2. Download this `/extra/cloudformation/auth-resources.yaml` on local machine.
3. Login to AWS console.
4. Go to CloudFormation service.
5. Click on Create Stack → Upload a Template file → Select the template file downloaded above.
6. Click Next → Enter your email → Next → Create the stack.
7. Once, the stack is created → Go to outputs of the stack & Copy them all.
8. Now, Browse to Github [amazon-location-features-demo-web](https://github.com/aws-geospatial/amazon-location-features-demo-web) repo.
9. Under the repo settings → Go to Secrets & Variables → Click on Actions.
10. Now, Add/Update the values in secrets as per the output values gathered from the cloudformation.
11. Add all keys from `.env` file to the secrets section of the repo as well from the above Requirements section.
```
> WEB_DOMAIN: "http://localhost:3000"
> IDENTITY_POOL_ID: "XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab" // Stack output as IdentityPoolId
> USER_DOMAIN: "https://XXXXXXXXXXXX.XXXX.XX-XXXX-X.amazoncognito.com/" // Stack output as UserDomain
> USER_POOL_CLIENT_ID: "XXXXXXXXXXXX" // Stack output as UserPoolClientId
> USER_POOL_ID: "XX-XXXX-X_XXXXXXXXXX" // Stack output as UserPoolId
> WEB_SOCKET_URL: "XXXXXXXXXXX-ats.iot.us-east-1.amazonaws.com" // Stack output as WebSocketUrl
> COGNITO_EMAIL: "abc@xyz.com" // Stack output as UserEmail
> COGNITO_PASSWORD: "XXXXXX" // This is the password for the cognito user (received on registered email)
> VITE_AWS_API_KEY_REGIONS
> VITE_AWS_API_KEYS
> VITE_AWS_COGNITO_IDENTITY_POOL_IDS
> VITE_AWS_WEB_SOCKET_URLS
> VITE_PINPOINT_IDENTITY_POOL_ID
> VITE_PINPOINT_APPLICATION_ID
> VITE_AWS_CF_TEMPLATE
> VITE_APPLE_APP_STORE_LINK
> VITE_GOOGLE_PLAY_STORE_LINK
> VITE_APP_VERSION
> VITE_MIGRATE_FROM_GOOGLE_MAPS_PAGE
> VITE_MIGRATE_A_WEB_APP_PAGE
> VITE_MIGRATE_AN_ANDROID_APP_PAGE
> VITE_MIGRATE_AN_IOS_APP_PAGE
> VITE_MIGRATE_A_WEB_SERVICE_PAGE
> VITE_PRICING_PAGE
> VITE_SHOW_NEW_NAVIGATION
```

#### `npm run cypress`

Runs Cypress tests to completion in a headed chrome browser.

## Security Tests

#### Env keys required in `security-tests/.env` file, see `security-tests/.env.example` for reference.

> IDENTITY_POOL_ID</br>
> USER_POOL_CLIENT_ID</br>
> USER_POOL_ID</br>
> COGNITO_EMAIL</br>
> COGNITO_PASSWORD</br>
> IAM_AUTH_ROLE_NAME</br>
> IAM_UNAUTH_ROLE_NAME</br>

#### If you are configuring Github actions for the Security tests, make sure to add the below env keys to the secrets section of the repo. You will need to use the values from the stack that was created when setting up the E2E tests.

```
> IDENTITY_POOL_ID: "XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab" // Stack output as IdentityPoolId
> USER_POOL_ID: "XX-XXXX-X_XXXXXXXXXX" // Stack output as UserPoolId
> USER_POOL_CLIENT_ID: "XXXXXXXXXXXX" // Stack output as UserPoolClientId
> COGNITO_EMAIL: "abc@xyz.com" // Stack output as UserEmail
> COGNITO_PASSWORD: "XXXXXX" // This is the password for the cognito user (received on registered email)
> IAM_AUTH_ROLE_NAME: "amazon-location-resources-AmazonLocationDemoCognit-XXXXXXXX" // Stack output as IAMAuthRoleName
> IAM_UNAUTH_ROLE_NAME: "amazon-location-resources-AmazonLocationDemoCognit-XXXXXXXX" // Stack output as IAMUnAuthRoleName
```

#### `npm run security-tests`

Runs Security tests insuring policies match the expected values.

## Unit Tests

#### Env keys required in `.env`.

> VITE_PINPOINT_IDENTITY_POOL_ID<br />
> VITE_PINPOINT_APPLICATION_ID<br />

#### If you are configuring Github actions for the Unit tests, make sure to add the below env keys to the secrets section of the repo. You will need to use the values from the stack that was created when setting up the app env in the very first step (These should already exist if you have setup secrets for E2E tests).

```
> VITE_PINPOINT_IDENTITY_POOL_ID: "XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab" // Same as VITE_PINPOINT_IDENTITY_POOL_ID
> VITE_PINPOINT_APPLICATION_ID: "XXXXXXXX" // Same as VITE_PINPOINT_APPLICATION_ID
```

#### `npm run test`

Run all the test cases for all the components within the repo.

#### `npm run coverage`

Run all the test cases for all the components within the repo and provides a coverage report.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## Getting Help

The best way to interact with our team is through GitHub.
You can [open an issue](https://github.com/aws-geospatial/amazon-location-features-demo-web/issues/new) and choose from one of our templates for
[bug reports](https://github.com/aws-geospatial/amazon-location-features-demo-web/issues/new?assignees=&labels=bug%2C+needs-triage&template=---bug-report.md&title=),
[feature requests](https://github.com/aws-geospatial/amazon-location-features-demo-web/issues/new?assignees=&labels=feature-request&template=---feature-request.md&title=)
or [guidance](https://github.com/aws-geospatial/amazon-location-features-demo-web/issues/new?assignees=&labels=guidance%2C+needs-triage&template=---questions---help.md&title=).
If you have a support plan with [AWS Support](https://aws.amazon.com/premiumsupport/), you can also create a new support case.

## Contributing

We welcome community contributions and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to set up a development environment and submit code.

## License

This library is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file.
