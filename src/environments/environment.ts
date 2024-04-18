import { appVersion } from './version';

export const environment = {
  production: false,
  clientId: 'APP-45A6EC5D-8206-4356-A105-2AFE5FA7A831',
  // clientId: 'APP-FDD7EABC-450A-426B-BDFA-3CBD87B7C56A',  // CRR one that works with localhost incase the other doesn't let you log in
  // clientId: 'APP-B43C4910-51CB-4A97-A16A-D611E48EF418',  // Note: unknown client ID Error
  // client id seen in https://services.aai.lifescience-ri.eu/spreg/auth/facilities/detail/3955 : 7cf4d894-7b95-4daf-b80f-96a350b2980d
  appVersion: appVersion,
  appTitle: 'crDSR: Data Sharing Repository',
  baseUrl: 'https://api-dsrdev.ecrin.org/api',
  wsBaseUrl: 'wss://api-dsrdev.ecrin.org/',  // Not up
  apiUrl: 'api',
  apiVersion: 'v1'
};

