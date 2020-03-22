import io = require('@actions/io');
import tc = require('@actions/tool-cache');
import fs = require('fs');
import path = require('path');

const tmpPath = path.join(__dirname, '.test-artifacts');

const toolDir = path.join(
  tmpPath,
  'runner',
  path.join(
    Math.random()
      .toString(36)
      .substring(7)
  ),
  'tools'
);
const tempDir = path.join(
  tmpPath,
  'runner',
  path.join(
    Math.random()
      .toString(36)
      .substring(7)
  ),
  'temp'
);

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;

import * as engine from '../src/engine';
import * as defaults from '../src/defaults';

describe('PyEnvInstaller', () => {
  it('Can download and cache the archive', async () => {
    const installer = new engine.PyEnvInstaller(defaults.PYENV_VERSION);
    const archive_path = await installer.downloadArchive();
    expect(fs.existsSync(archive_path)).toBeTruthy();
  });

  it('Errors if version is not found', async () => {
    const installer = new engine.PyEnvInstaller('invalid');

    let error = null;
    try {
      await installer.downloadArchive();
    } catch (e) {
      error = `${e}`;
    }
    expect(error).toEqual('Error: Unexpected HTTP response: 404');
  });

  it('Installs pyenv', async () => {
    const installer = new engine.PyEnvInstaller(defaults.PYENV_VERSION);
    const archive_path = await installer.downloadArchive();
    await installer.installFromArchive(archive_path);
    const cachepath = tc.find('pyenv', defaults.PYENV_VERSION);
    const pyenv_bin = path.join(cachepath, 'bin', 'pyenv');
    const stat = fs.statSync(pyenv_bin);
    expect(stat.isFile()).toBeTruthy();
  });
});
