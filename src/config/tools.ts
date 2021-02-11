function env(variable, defaultValue) {
  if (typeof variable === 'undefined') {
    return defaultValue;
  }
  return variable;
}

export function requireEnv(variable, name) {
  if (typeof variable === 'undefined') {
    throw new Error(`Variable ${name} is required`);
  }
  return variable;
}

export function booleanEnv(variable) {
  return env(variable, false) === 'true';
}
