import { appVersion } from './version';

export const environment = {
  production: true,
  appVersion: appVersion,
  appTitle: 'crDSR: Data Sharing Repository',
  baseUrl: 'https://api-test.ecrin-rms.org/api',
  wsBaseUrl: 'wss://api-test.ecrin-rms.org/',
  apiUrl: 'api',
  apiVersion: 'v1'
};
