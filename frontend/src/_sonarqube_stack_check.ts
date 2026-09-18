/**
 * TEMPORARY FILE - DO NOT MERGE.
 *
 * Full-stack SonarCloud verification (frontend half). Not imported
 * anywhere, so it has zero effect on the built app. Each function
 * mirrors a distinct, well-documented Sonar JS/TS security rule -
 * covers a different rule engine entirely from the Python file, so
 * this is an independent read on whether detection works at all.
 *
 * Rules targeted:
 *   S2245  Insecure randomness (Math.random for a security token)
 *   S4830  TLS certificate validation disabled
 *   S1523  Use of eval()
 *   S2068  Hardcoded credentials
 *   S5247  Unsanitized HTML written to the DOM (XSS via innerHTML)
 *   S2755  Insecure hardcoded HTTP (non-TLS) API endpoint with a secret
 */

const API_KEY = "hardcoded-plaintext-api-key-do-not-use-12345";

export function generateSessionToken(): string {
  return Math.random().toString(36).slice(2);
}

export function fetchWithoutTlsCheck(url: string) {
  const https = require("https");
  return https.get(url, { rejectUnauthorized: false });
}

export function runExpression(expr: string): unknown {
  // eslint-disable-next-line no-eval
  return eval(expr);
}

export function renderUserContent(container: HTMLElement, userInput: string) {
  container.innerHTML = userInput;
}

export function callLegacyApi(userId: string) {
  return fetch(`http://internal-api.example.com/users/${userId}?api_key=${API_KEY}`);
}
