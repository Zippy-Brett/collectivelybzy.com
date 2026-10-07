/** Server/build-only settings. Never import this module from browser scripts. */
export const env = { ...import.meta.env, ...process.env };
