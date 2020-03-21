import * as core from '@actions/core';
import * as github from '@actions/github';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';

function get_array_from_comma_separatad_input(name: string) {
  return name.split(',').map(function(path) {
    return path.trim();
  });
}

async function run() {
  try {
    // Read inputs
    const default_version = core.getInput('default');

    const command = core.getInput('command');
    const versions = get_array_from_comma_separatad_input(
      core.getInput('versions')
    );

    // Prepare contextual variables and urls
    const pyenv_version = 'v1.2.17';
    const pyenv_root_name = `.pyenv@${pyenv_version}`;
    const pyenv_tarball_url = `https://github.com/pyenv/pyenv/archive/${pyenv_version}.tar.gz`;

    // Download pyenv tarball IO#1
    console.log(`Downloading pyenv ${pyenv_version}...`);
    const pyenv_tarball_path = await tc.downloadTool(pyenv_tarball_url);

    // Extract tarball
    console.log(`Installing pyenv ${pyenv_version}...`);
    const pyenv_root_path = await tc.extractZip(
      pyenv_tarball_path,
      pyenv_root_name
    );

    // Cache for future usage
    const cached_pyenv_path = await tc.cacheDir(
      pyenv_root_path,
      'pyenv',
      pyenv_version
    );
    console.log(`pyenv local ${default_version}...`);

    // Setup pyenv in build environment, from this point on pyenv is available!
    core.addPath(`${cached_pyenv_path}/bin`);
    core.exportVariable('PYENV_ROOT', cached_pyenv_path);

    // pre-install all pyenv versions

    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`Event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
