/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import fs from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Environnement en ligne (Claude Code) : Chromium « headless shell » déjà installé par Playwright.
// Ailleurs, Remotion télécharge le sien automatiquement.
const SHELL_PLAYWRIGHT = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`;
if (fs.existsSync(SHELL_PLAYWRIGHT)) {
  Config.setBrowserExecutable(SHELL_PLAYWRIGHT);
}
