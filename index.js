const core = require("@actions/core");
const github = require("@actions/github");
const tc = require('@actions/tool-cache');

function get_array_input(name) {
  result = core.getInput(name);
  if (! result instanceof Array) {
    throw new Error(`'input "${name}" is not an array`);
  }
  return result;
}


try {
  // Read inputs
  const defaultVersion = core.getInput("default");
  const rootName = core.getInput("pyenv_root_name") || '.pyenv';

  const commands = get_array_input("commands");
  const versions = get_array_input("versions");

  const pyenvRoot = `${process.env.HOME}/${rootName}`
  const newPathEnvVar = `${pyenvRoot}:${process.env.PATH}`

  // Download pyenv-installer
  const pyenvInstallerPath = await tc.downloadTool('https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer');

  // Install Pyenv
  console.log(`Installing Pyenv ...`);
  console.log(`pyenv global ${defaultVersion}...`);

  // Install
  core.exportVariable('PATH', newPath);
  core.exportVariable('PYENV_SHELL', newPath);
  core.setOutput("pyenv_root", pyenvRoot);

  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`Event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
