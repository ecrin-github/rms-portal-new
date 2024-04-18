import { appVersion } from './version';

export const environment = {
  production: false,
  // authority: 'https://proxy.aai.lifescience-ri.eu/',  // LS AAI V1
  authority: 'https://login.aai.lifescience-ri.eu/oidc',  // LS AAI V2 (note: doesn't work with trailing slash)
  clientId: '7cf4d894-7b95-4daf-b80f-96a350b2980d',  // LS AAI V2 - dev
  // clientId: '78dbf43b-bcb7-4a6a-8023-ca930d5ed0e2',  // LS AAI V2 - prod
  // clientId: 'APP-45A6EC5D-8206-4356-A105-2AFE5FA7A831',  // LS AAI V1 - prod + dev
  // clientId: 'APP-FDD7EABC-450A-426B-BDFA-3CBD87B7C56A',  // LS AAI V1 - CRR one that works with localhost incase the other doesn't let you log in
  userInfoUrl: 'https://login.aai.lifescience-ri.eu/oidc/userinfo',  // LS AAI V2
  appVersion: appVersion,
  appTitle: 'crDSR: Data Sharing Repository',
  baseUrl: 'https://api-dsrdev.ecrin.org/api',
  wsBaseUrl: 'wss://api-dsrdev.ecrin.org/',  // Not up
  apiUrl: 'api',
  apiVersion: 'v1'
};