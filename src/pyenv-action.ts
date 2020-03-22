import * as core from '@actions/core';
import * as github from '@actions/github';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';

import * as engine from './engine';

async function run() {
  try {
    // Parse inputs and prepare context for installer

    const context = new engine.BuildContext({
      pyenv_version: '1.2.17'
    });

    // Download and Install pyenv
    const installer = new engine.PyEnvInstaller(context.pyenv_version);

    const archive_path = await installer.downloadArchive();
    const pyenv_root = await installer.installFromArchive(archive_path);

    // Setup build environment to support pyenv
    const build_environment = new engine.EnvironmentManager({
      context,
      pyenv_root
    });
    // this call makes the pyenv binary available to the PATH and
    // enable the command pyenv install by setting PYENV_ROOT environment variable.

    // At this point pyenv is ready to be used, next we pre-install the python versions declared
    build_environment.setup();

    // pre-install all pyenv versions
    build_environment.debug();
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
