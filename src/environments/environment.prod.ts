import { appVersion } from './version';

export const environment = {
  production: true,
  authority: 'https://proxy.aai.lifescience-ri.eu/',
  clientId: 'APP-FDD7EABC-450A-426B-BDFA-3CBD87B7C56A',
  userInfoUrl: 'https://proxy.aai.lifescience-ri.eu/OIDC/userinfo',
  appVersion: appVersion,
  appTitle: 'crDSR: Data Sharing Repository',
  baseUrl: 'https://api-test.ecrin-rms.org/api',
  wsBaseUrl: 'wss://api-test.ecrin-rms.org/',
  apiUrl: 'api',
  apiVersion: 'v1'
};
