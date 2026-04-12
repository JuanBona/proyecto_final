export const AUTH_SECRETS = Symbol('AUTH_SECRETS');

export type AuthSecrets = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
};

const getRequiredEnv = (name: 'ACCESS_TOKEN_SECRET' | 'REFRESH_TOKEN_SECRET') => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

export const createAuthSecrets = (): AuthSecrets => ({
  accessTokenSecret: getRequiredEnv('ACCESS_TOKEN_SECRET'),
  refreshTokenSecret: getRequiredEnv('REFRESH_TOKEN_SECRET'),
});
