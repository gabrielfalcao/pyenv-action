import * as path from 'path';
import * as fs from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';

import * as utils from './utils';

interface BuildContextParams {
  pyenv_version: string;
}

export class ParsedInputs {
  // the types below represent the inputs from action.yml, the mapping
  // is done in the constructor retrieves inputs using @actions/core,
  // parses them into correct types and set these readonly properties.
  readonly default_version: string;
  private explicit_versions: Array<string>;
  readonly command: string;

  constructor() {
    this.default_version = core.getInput('default');
    this.command = core.getInput('command');
    this.explicit_versions = utils.splitcommas(core.getInput('versions'));
  }
  get versions() {
    const values = utils.unique(this.explicit_versions);
    values.push(this.default_version);
    values.sort();
    return values;
  }
}

export class BuildContext {
  readonly pyenv_version: string;
  readonly inputs: ParsedInputs;

  constructor(params: BuildContextParams) {
    const {pyenv_version} = params;
    this.pyenv_version = pyenv_version;
    this.inputs = new ParsedInputs();
  }
}

interface EnvironmentManagerParams {
  pyenv_root: string;
  context: BuildContext;
}

export class PyEnvInstaller {
  readonly pyenv_version: string;

  private archive_path: string;
  private deflated_location: string;

  get archive_url(): string {
    return `https://github.com/pyenv/pyenv/archive/v${this.pyenv_version}.zip`; // note the deliberate "v" prefix of pyenv version
  }

  constructor(pyenv_version: string) {
    this.pyenv_version = pyenv_version;
    this.archive_path = `/tmp/pyenv-${this.pyenv_version}-inflated`;
    this.deflated_location = tc.find('pyenv', this.pyenv_version);
  }

  get pyenv_root(): string {
    return this.deflated_location;
  }

  async downloadArchive(): Promise<string> {
    return new Promise<string>((accept, reject) => {
      console.log(`downloading ${this.archive_url}`);
      tc.downloadTool(this.archive_url)
        .then(archive_path => {
          if (!fs.existsSync(archive_path)) {
            return reject(new Error(`${archive_path} does not exist`));
          }
          this.archive_path = archive_path;
          accept(archive_path);
        })
        .catch(err => {
          reject(
            new Error(
              `Cannot download archive for pyenv "${this.pyenv_version}": ${err.message}`
            )
          );
        });
    });
  }

  async installFromArchive(archive_path: string): Promise<string> {
    return new Promise<string>((accept, reject) => {
      if (!fs.existsSync(this.archive_path)) {
        return accept(this.archive_path);
      }
      tc.extractZip(archive_path, tc.find('pyenv', this.pyenv_version))
        .then(inflation_path => {
          console.log(`Extracted ${archive_path} to ${inflation_path}.`);
          const deflated_location = path.join(
            inflation_path,
            `pyenv-${this.pyenv_version}`
          ); // TODO: find the path with glob matching the version
          if (!fs.existsSync(deflated_location)) {
            return reject(
              new Error(
                `failed to deflate ${archive_path}: ${deflated_location} does not exist`
              )
            );
          }

          tc.cacheDir(deflated_location, 'pyenv', this.pyenv_version)
            .then(pyenv_root => {
              core.setOutput('pyenv_root', pyenv_root);
              accept(pyenv_root);
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

export class EnvironmentManager {
  private context: BuildContext;
  private inputs: ParsedInputs;
  readonly pyenv_root: string;
  readonly pyenv_binpath: string;

  constructor(params: EnvironmentManagerParams) {
    const {context, pyenv_root} = params;
    this.context = context;
    this.inputs = context.inputs;
    this.pyenv_root = pyenv_root;
    this.pyenv_binpath = `${this.pyenv_root}/bin`;

    if (!fs.existsSync(this.pyenv_root)) {
      throw new Error(
        `${this.pyenv_root} does not exist, make sure to install pyenv before setting up the environment`
      );
    }
    if (!fs.existsSync(this.pyenv_binpath)) {
      throw new Error(
        `${this.pyenv_binpath} does not exist, make sure to install pyenv before setting up the environment`
      );
    }
  }

  setup() {
    core.exportVariable('PYENV_ROOT', this.pyenv_root);
    console.log(`export PYENV_ROOT="${this.pyenv_root}"`);

    core.addPath(this.pyenv_binpath);
    console.log(`Patched PATH with "${this.pyenv_binpath}"`);
  }

  async run_pyenv_install(version: string): Promise<string> {
    return new Promise<string>((accept, reject) => {
      exec
        .exec(`pyenv install ${version}`)
        .then(() => {
          console.log(`Sucessfully installed python ${version}`);
          accept(version);
        })
        .catch(error => {
          console.error(`Failed to install python ${version}`);
          reject(error);
        });
    });
  }
  async install_versions(): Promise<Array<string>> {
    return new Promise<Array<string>>((accept, reject) => {
      const installed: Array<string> = [];
      this.context.inputs.versions.forEach(version => {
        this.run_pyenv_install(version)
          .then(() => {
            installed.push(version);
            if (installed.length == this.inputs.versions.length) {
              accept(installed);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }
  debug() {
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`Event payload: ${payload}`);
  }
}
