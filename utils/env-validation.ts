/**
 * Environment Variable Validation
 * Validates required environment variables at runtime
 * Fails fast with clear error messages if variables are missing
 */

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * List of required environment variables
 * Add new required variables here
 */
const REQUIRED_ENV_VARS = {
  // Supabase - Public (exposed to client)
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase project URL',
    validate: (value: string) => value.startsWith('https://') || value.startsWith('http://'),
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase anonymous key',
    validate: (value: string) => value.length > 20, // Basic validation
  },

  // Supabase - Server-side only
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    description: 'Supabase service role key',
    validate: (value: string) => value.length > 20,
  },

  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL connection string',
    validate: (value: string) =>
      value.startsWith('postgresql://') || value.startsWith('postgres://'),
  },

  // Stripe
  STRIPE_SECRET_KEY: {
    required: true,
    description: 'Stripe secret key',
    validate: (value: string) => value.startsWith('sk_'),
  },
} as const;

/**
 * Optional environment variables with validation
 */
const OPTIONAL_ENV_VARS = {
  NEXT_PUBLIC_SITE_URL: {
    description: 'Public site URL',
    validate: (value: string) => value.startsWith('https://') || value.startsWith('http://'),
  },
  NEXT_PUBLIC_WEBSITE_URL: {
    description: 'Public website URL',
    validate: (value: string) => value.startsWith('https://') || value.startsWith('http://'),
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key',
    validate: (value: string) => value.startsWith('pk_'),
  },
  STRIPE_WEBHOOK_SECRET: {
    description: 'Stripe webhook signing secret',
    validate: (value: string) => value.startsWith('whsec_'),
  },
} as const;

/**
 * Validates all environment variables
 * @returns Validation result with missing variables and warnings
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];

    if (!value) {
      missing.push(`${key} (${config.description})`);
    } else if (config.validate && !config.validate(value)) {
      warnings.push(`${key} appears to be invalid (${config.description})`);
    }
  }

  // Check optional variables (warn if missing in production)
  if (process.env.NODE_ENV === 'production') {
    for (const [key, config] of Object.entries(OPTIONAL_ENV_VARS)) {
      const value = process.env[key];
      if (!value) {
        warnings.push(`${key} is not set (${config.description}) - may be required in production`);
      } else if (config.validate && !config.validate(value)) {
        warnings.push(`${key} appears to be invalid (${config.description})`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validates environment variables and throws if any are missing
 * Call this at application startup
 * @throws Error if required environment variables are missing
 */
export function requireEnvironmentVariables(): void {
  const result = validateEnvironmentVariables();

  if (!result.valid) {
    const errorMessage = [
      'Missing required environment variables:',
      ...result.missing.map((v) => `  - ${v}`),
      '',
      'Please set these variables in your Vercel project settings or .env file.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Log warnings but don't fail
  if (result.warnings.length > 0) {
    console.warn('Environment variable warnings:');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

/**
 * Get a validated environment variable
 * @param key Environment variable key
 * @param defaultValue Optional default value
 * @returns Environment variable value
 * @throws Error if variable is missing and no default provided
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Environment variable ${key} is not set and no default value provided`);
  }

  return value;
}

/**
 * Get a validated environment variable (returns undefined if missing)
 * @param key Environment variable key
 * @returns Environment variable value or undefined
 */
export function getEnvVarOptional(key: string): string | undefined {
  return process.env[key];
}
