// auth.js — Get authenticated Google API client using gog's stored credentials
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

async function getAuth() {
  const clientSecretPath = path.join(process.env.HOME, ".config/gog/client_secret.json");
  const clientSecret = JSON.parse(fs.readFileSync(clientSecretPath, "utf8"));
  const key = Object.keys(clientSecret)[0];
  const { client_id, client_secret } = clientSecret[key];

  const tokenPath = "/tmp/gog-token.json";
  // Export fresh token from gog if needed
  const { execSync } = require("child_process");
  execSync(
    `GOG_KEYRING_PASSWORD=${process.env.GOG_KEYRING_PASSWORD} GOG_ACCOUNT=${process.env.GOG_ACCOUNT} gog auth tokens export ${process.env.GOG_ACCOUNT} --out ${tokenPath} --overwrite 2>/dev/null`,
  );

  const tokenData = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
  oauth2Client.setCredentials({ refresh_token: tokenData.refresh_token });

  // Force token refresh
  await oauth2Client.getAccessToken();

  return oauth2Client;
}

module.exports = { getAuth };
