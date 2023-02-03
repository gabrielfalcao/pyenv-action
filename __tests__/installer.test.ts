import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';
import * as path from 'path';

import * as engine from '../src/engine';
import * as defaults from '../src/defaults';

const tmpPath = path.join(__dirname, '.installer-tmp');

//jestjs.io/docs/en/asynchronous
https: describe('PyEnvInstaller', () => {
  beforeAll(async () => {
    const toolDir = path.join(
      tmpPath,
      'runner',
      path.join(Math.random().toString(36).substring(7)),
      'tools'
    );
    const tempDir = path.join(
      tmpPath,
      'runner',
      path.join(Math.random().toString(36).substring(7)),
      'temp'
    );
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
    process.env['RUNNER_TOOL_CACHE'] = toolDir;
    process.env['RUNNER_TEMP'] = tempDir;
  }, 100000);
  it('Can download and cache the archive', async () => {
    const installer = new engine.PyEnvInstaller(defaults.PYENV_VERSION);
    const archive_path = await installer.downloadArchive();
    expect(fs.existsSync(archive_path)).toBeTruthy();
  });

  it('Throws error if required pyenv version could not be downloaded', async () => {
    const installer = new engine.PyEnvInstaller('0.0.0');

    let error = null;
    try {
      await installer.downloadArchive();
    } catch (e) {
      error = e.message;
    }
    expect(error).toEqual(
      'Cannot download archive for pyenv "0.0.0": Unexpected HTTP response: 404'
    );
  });

  it('Can install pyenv', async () => {
    const installer = new engine.PyEnvInstaller(defaults.PYENV_VERSION);
    const archive_path = await installer.downloadArchive();
    const pyenv_root = await installer.installFromArchive(archive_path);
    expect(fs.existsSync(pyenv_root)).toBeTruthy();

    const pyenv_bin = path.join(pyenv_root, 'bin', 'pyenv');
    expect(fs.existsSync(pyenv_bin)).toBeTruthy();

    const stat = fs.statSync(pyenv_bin);
    expect(stat.isFile()).toBeTruthy();
    // Running again should simply use cache
    const cached_path = await installer.installFromArchive(archive_path);
    expect(cached_path).toEqual(pyenv_root);
  });
});
