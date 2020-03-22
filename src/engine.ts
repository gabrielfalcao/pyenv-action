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
  private archive_path: string | null;
  private archive_cache: string | null;

  get archive_url(): string {
    return `https://github.com/pyenv/pyenv/archive/v${this.pyenv_version}.zip`; // note the deliberate "v" prefix of pyenv version
  }

  constructor(pyenv_version: string) {
    this.pyenv_version = pyenv_version;
    this.archive_path = null;
    this.archive_cache = null;
  }

  async downloadArchive(): Promise<string> {
    return new Promise<string>(done => {
      console.log(`downloading ${this.archive_url}`);
      tc.downloadTool(this.archive_url).then(archive_path => {
        this.archive_path = archive_path;

        console.log(`saved ${archive_path}`);
        tc.cacheFile(
          path.dirname(archive_path),
          path.basename(archive_path),
          `v${this.pyenv_version}.zip`,
          this.pyenv_version
        ).then(cached_path => {
          this.archive_cache = cached_path;
          done(cached_path);
        });
      });
    });
  }

  async installFromArchive(archive_path: string): Promise<string> {
    return new Promise<string>(done => {
      tc.extractZip(archive_path, 'pyenv-inflated').then(inflation_path => {
        console.log(`Extracted ${archive_path} to ${inflation_path}.`);
        tc.cacheDir(inflation_path, 'pyenv', this.pyenv_version).then(
          pyenv_root => {
            console.log(`Cached ${inflation_path} in ${pyenv_root}.`);
            done(pyenv_root);
          }
        );
      });
    });
  }
}

export class EnvironmentManager {
  private context: BuildContext;

  readonly pyenv_root: string;
  readonly pyenv_binpath: string;

  constructor(params: EnvironmentManagerParams) {
    const {context, pyenv_root} = params;
    this.context = context;
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

  debug() {
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`Event payload: ${payload}`);
  }
}
