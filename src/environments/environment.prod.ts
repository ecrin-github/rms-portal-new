import { appVersion } from './version';

export const environment = {
  production: true,
  appVersion: appVersion,
  appTitle: 'crDSR: Data Sharing Repository',

  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: true,

  hostname: 'http://localhost:5001/',

  restApiUrl: 'rest/',
  restApiVersion: 'v1/',

  graphQlUrl: 'graphql/',
  graphQlVersion: 'v1'

};
