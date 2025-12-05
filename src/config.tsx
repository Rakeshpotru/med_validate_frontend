
const ENV_STATE = import.meta.env.VITE_ENV_STATE || "dev";

const getEnvValue = (prefix: string, key: string): string | undefined => {
  const varName = `VITE_${prefix.toUpperCase()}_${key.toUpperCase()}`; // e.g., VITE_DEV_BASE_URL
  return import.meta.env[varName as keyof ImportMetaEnv];
};

export const AppConfig = {
  env: ENV_STATE,
  baseURL: getEnvValue(ENV_STATE, "base_url"),
  wsBaseURL: getEnvValue(ENV_STATE, "ws_base_url"),
  // add more dynamic keys here if needed
};
