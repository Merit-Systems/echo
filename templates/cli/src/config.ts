import Configstore from 'configstore';

interface Config {
  accessToken?: string;
  refreshToken?: string;
  appId?: string;
}

const config = new Configstore('echoai-cli');

export function getConfig(): Config {
  return {
    accessToken: config.get('accessToken'),
    refreshToken: config.get('refreshToken'),
    appId: config.get('appId'),
  };
}

export function setAccessToken(token: string): void {
  config.set('accessToken', token);
}

export function setRefreshToken(token: string): void {
  config.set('refreshToken', token);
}

export function setAppId(appId: string): void {
  config.set('appId', appId);
}

export function clearConfig(): void {
  config.clear();
}

export function isAuthenticated(): boolean {
  return Boolean(config.get('accessToken') && config.get('appId'));
}

