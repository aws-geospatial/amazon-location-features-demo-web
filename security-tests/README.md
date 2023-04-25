# Amazon Location Web - Security Tests

## Requirements
1. This project is developed using Node v14.19.2
2. Run the [CF template](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create?stackName=amazon-location-resources-setup&templateURL=https://amazon-location-demo-resources.s3.amazonaws.com/location-services.yaml) using any AWS account and get all the required keys for the `.env` from stack output
3. Keys mentioned above will be added to `.env` file, which is required to run the test
4. Make sure policies for unauth and auth are added to `constants` folder before running the test

#### Env keys required in `.env` file, see `.env.example` for reference
>VITE_AWS_COGNITO_IDENTITY_POOL_ID_TEST=<VITE_AWS_COGNITO_IDENTITY_POOL_ID_TEST><br />
VITE_AWS_REGION_TEST=<VITE_AWS_REGION_TEST><br />
VITE_AWS_USER_POOL_ID_TEST=<VITE_AWS_USER_POOL_ID_TEST><br />
VITE_AWS_USER_POOL_WEB_CLIENT_ID_TEST=<VITE_AWS_USER_POOL_WEB_CLIENT_ID_TEST><br />
VITE_AWS_COGNITO_USERNAME_TEST=<VITE_AWS_COGNITO_USERNAME_TEST><br />
VITE_AWS_COGNITO_PASSWORD_TEST=<VITE_AWS_COGNITO_PASSWORD_TEST><br />
VITE_AWS_IAM_AUTH_ROLE_NAME_TEST=<VITE_AWS_IAM_AUTH_ROLE_NAME_TEST><br />
VITE_AWS_IAM_UNAUTH_ROLE_NAME_TEST=<VITE_AWS_IAM_UNAUTH_ROLE_NAME_TEST><br />

## Configure
>cd security-tests/<br />
yarn run-test<br />

## Description
This project is a sample application to test the policies created by CF template for unauth and auth cognito roles.

This is accomplished by signing in the user using creds from env, and then using the credentials to instantiate IAM client and fetch the role policies for unauth and auth and matching them with the one's stored in constants.
