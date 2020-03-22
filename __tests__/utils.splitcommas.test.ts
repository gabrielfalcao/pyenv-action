import * as utils from '../src/utils';

describe('utils.splitcommas()', () => {
  it('supports a single version', async () => {
    expect(utils.splitcommas('1.2.3')).toEqual(['1.2.3']);
  });
  it('supports a multiple versions', async () => {
    expect(utils.splitcommas('1.2.3,4.5.6')).toEqual(['1.2.3', '4.5.6']);
  });
  it('allows trailing commas', async () => {
    expect(utils.splitcommas('8.8.8,')).toEqual(['8.8.8']);
    expect(utils.splitcommas(',8.8.8')).toEqual(['8.8.8']);
    expect(utils.splitcommas(',8.8.8,')).toEqual(['8.8.8']);
  });
});
