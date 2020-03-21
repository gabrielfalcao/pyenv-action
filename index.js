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
  const default_version = core.getInput("default");

  const commands = get_array_input("commands");
  const versions = get_array_input("versions");

  // Prepare contextual variables and urls
  const pyenv_version = 'v1.2.17'
  const pyenv_root_name = `.pyenv@${pyenv_version}`
  const pyenv_tarball_url = `https://github.com/pyenv/pyenv/archive/${pyenv_version}.tar.gz`;

  // Download pyenv tarball IO#1
  console.log(`Downloading pyenv ${pyenv_version}...`);
  const pyenv_tarball_path = await tc.downloadTool(pyenv_tarball_url);

  // Extract tarball
  console.log(`Installing pyenv ${pyenv_version}...`);
  const pyenv_root_path = await tc.extractZip(pyenv_tarball_path, pyenv_root_name);

  // Cache for future usage
  const cached_pyenv_path = await tc.cacheDir(pyenv_root_path, 'pyenv', pyenv_version);
  console.log(`pyenv local ${default_version}...`);

  // Safely determine the location of pyenv shims
  const pyenv_shims_path = `${cached_pyenv_path}/shims`

  // Prepend shims location to PATH
  core.addPath(pyenv_shims_path);
  core.exportVariable('PYENV_SHELL', process.env.SHELL);
  core.setOutput("pyenv_root", cached_pyenv_path);

  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`Event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
