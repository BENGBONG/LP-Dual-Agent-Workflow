#!/usr/bin/env node

import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "lp-dual-agent-workflow";
const INSTALL_ITEMS = ["SKILL.md", "templates", "agents"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");

function usage() {
  return `LP Dual-Agent Workflow installer

Usage:
  lp-dual-agent-workflow install [options]

Options:
  --target <dir>   Skills root directory. Default: ~/.codex/skills
  --codex          Install to ~/.codex/skills
  --agents         Install to ~/.agents/skills
  --force          Overwrite an existing lp-dual-agent-workflow install
  --dry-run        Show what would be copied without writing files
  -h, --help       Show this help message

Examples:
  npx lp-dual-agent-workflow install
  npx lp-dual-agent-workflow install --agents
  npx lp-dual-agent-workflow install --target ~/.agents/skills --force
`;
}

function expandHome(inputPath) {
  if (inputPath === "~") return os.homedir();
  if (inputPath.startsWith("~/")) return path.join(os.homedir(), inputPath.slice(2));
  return inputPath;
}

function parseArgs(argv) {
  const options = {
    command: "install",
    targetRoot: path.join(os.homedir(), ".codex", "skills"),
    force: false,
    dryRun: false,
    help: false
  };

  const args = [...argv];
  if (args[0] && !args[0].startsWith("-")) {
    options.command = args.shift();
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--target") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--target requires a directory path");
      }
      options.targetRoot = expandHome(value);
      index += 1;
    } else if (arg === "--codex") {
      options.targetRoot = path.join(os.homedir(), ".codex", "skills");
    } else if (arg === "--agents") {
      options.targetRoot = path.join(os.homedir(), ".agents", "skills");
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copySkillFiles(destination) {
  await fs.mkdir(destination, { recursive: true });

  for (const item of INSTALL_ITEMS) {
    const source = path.join(packageRoot, item);
    const target = path.join(destination, item);
    await fs.cp(source, target, {
      recursive: true,
      force: true,
      errorOnExist: false,
      verbatimSymlinks: true
    });
  }
}

async function install(options) {
  const targetRoot = path.resolve(options.targetRoot);
  const destination = path.join(targetRoot, SKILL_NAME);

  if (options.dryRun) {
    console.log(`Would install ${SKILL_NAME} to ${destination}`);
    return;
  }

  if ((await pathExists(destination)) && !options.force) {
    throw new Error(
      `${destination} already exists. Re-run with --force to overwrite it.`
    );
  }

  await copySkillFiles(destination);
  console.log(`Installed ${SKILL_NAME} to ${destination}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage());
    return;
  }

  if (options.command !== "install") {
    throw new Error(`Unknown command: ${options.command}\n\n${usage()}`);
  }

  await install(options);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
