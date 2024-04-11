import { appVersion } from './version';

export const environment = {
  production: false,
  appVersion: appVersion,
  appTitle: 'crDSR: Data Sharing Repository',
  baseUrl: 'https://api-dsrdev.ecrin.org/api',
  wsBaseUrl: 'wss://api-dsrdev.ecrin.org/',  // Not up
  apiUrl: 'api',
  apiVersion: 'v1'
};

