import 'jest';
import { tester } from './config';
import * as backend from '../src/index';
import * as axios from 'axios';

describe('Maps', () => {

  afterAll(async () => {
    tester.cleanup();
  });

  it('should SCAN the MAP', async () => {
    jest.spyOn(axios.default, 'post').mockResolvedValue({ data: { elements: [] } });
    const response = await backend.scanMap(0, 0, 1000);
    expect(response.data.elements).toBeInstanceOf(Array);
    expect(response.data.elements.length).toBe(0);
    expect(axios.default.post).toHaveBeenCalled();
  });

  it('should DRAW the MAP', async () => {
    const points = [
      {
        geometry: {
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
        tags: {
          name: 'test',
        },
      },
    ];
    await backend.drawMap(points);
  });

  it('should POPULATE the MAP', async () => {
    const scanMapSpy = jest.spyOn(backend, 'scanMap').mockResolvedValue({ data: { elements: [] }});
    await backend.populateMap(0, 0);
    expect(scanMapSpy).toHaveBeenCalled();
  });

});
