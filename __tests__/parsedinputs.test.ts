jest.mock('@actions/core', () => {
  const originalModule = jest.requireActual('@actions/core');
  return {
    __esModule: true,
    ...originalModule,
    error: jest.fn(),
    exportVariable: jest.fn(),
    setOutput: jest.fn(),
  };
});
const core = require('@actions/core');
import * as engine from '../src/engine';

describe('ParsedInputs', () => {
  it('list versions when no inputs were provided', () => {
    const inputs = new engine.ParsedInputs();
    expect(inputs.versions).toEqual([]);
  });
  it("annotates the build with error when user does not define the `default' input", () => {

    process.env['INPUT_DEFAULT'] = '';
    process.env['INPUT_VERSIONS'] = '';

    const inputs = new engine.ParsedInputs();
    expect(core.error.mock.calls).toHaveLength(1);
    expect(core.error.mock.calls[0]).toEqual(["the `default' input appears to be undefined or empty"]);
  });
  it('list versions when only default is provided', () => {
    // Given that the input "default: 3.7.2"
    process.env['INPUT_DEFAULT'] = '3.7.2';
    const inputs = new engine.ParsedInputs();
    expect(inputs.versions).toEqual(['3.7.2']);
  });
  it('list versions when only extra versions are provided', () => {
    // Given that the input "default: 3.7.2"
    process.env['INPUT_DEFAULT'] = '3.7.2';
    // And that the input "versions: 3.6.4,3.7.3,3.6.5"
    process.env['INPUT_VERSIONS'] = '3.6.4,3.7.3,3.6.5';
    const inputs = new engine.ParsedInputs();
    expect(inputs.versions).toEqual(['3.6.4', '3.6.5', '3.7.2', '3.7.3']);
  });
});
