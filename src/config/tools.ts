function env(variable: string | undefined, defaultValue: string) {
  if (typeof variable === 'undefined') {
    return defaultValue;
  }
  return variable;
}

export function requireEnv(variable: string | undefined, name: string) {
  if (typeof variable === 'undefined') {
    throw new Error(`Variable ${name} is required`);
  }
  return variable;
}

export function booleanEnv(variable: string | undefined) {
  return env(variable, 'false') === 'true';
}
