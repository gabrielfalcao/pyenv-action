import * as engine from '../src/engine';

describe('ParsedInputs', () => {
  it('list versions when only default is provided', () => {
    // Given that the input "default: 3.7.2"
    process.env['INPUT_DEFAULT'] = '3.7.2';
    const inputs = new engine.ParsedInputs();
    expect(inputs.versions).toEqual(['3.7.2']);
  });
});
