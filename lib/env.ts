export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAdminCredentials() {
  return {
    username: requireEnv('ADMIN_USERNAME'),
    password: requireEnv('ADMIN_PASSWORD'),
  };
}

export function getSessionSecret() {
  return requireEnv('SESSION_SECRET');
}

export function getDatabaseUrl() {
  return requireEnv('DATABASE_URL');
}
