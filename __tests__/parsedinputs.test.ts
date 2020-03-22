import * as engine from '../src/engine';

describe('ParsedInputs', () => {
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
