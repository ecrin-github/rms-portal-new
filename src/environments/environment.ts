import { appVersion } from './version';

// Note: constants relating to LS AAI must be the same as the constants in the BE
const baseUrl = 'https://api-dsrdev.ecrin.org';  // No trailing slash
export const environment = {
  production: false,
  // LS AAI V2
  authority: 'https://login.aai.lifescience-ri.eu/oidc',  // No trailing slash
  clientId: '7cf4d894-7b95-4daf-b80f-96a350b2980d',  // Dev
  userInfoUrl: 'https://login.aai.lifescience-ri.eu/oidc/userinfo',
  // LS AAI V1
  // authority: 'https://proxy.aai.lifescience-ri.eu/',
  // clientId: 'APP-45A6EC5D-8206-4356-A105-2AFE5FA7A831',  // prod + dev
  // clientId: 'APP-FDD7EABC-450A-426B-BDFA-3CBD87B7C56A',  // CRR one that works with localhost incase the other doesn't let you log in
  // userInfoUrl: 'https://proxy.aai.lifescience-ri.eu/OIDC/userinfo',
  appVersion: appVersion,
  appTitle: 'crDSR: Data Sharing Repository',
  baseUrl: baseUrl,
  baseUrlApi: baseUrl + '/api',  // No trailing slash
  wsBaseUrl: 'wss://api-dsr.ecrin.org/',
  apiUrl: 'api',
  tsdUploadPath: 'test',
  apiVersion: 'v1'
};