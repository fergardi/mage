import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'MAP';

describe(KINGDOM, () => {

  afterAll(async () => {
    tester.cleanup();
  });

  it('should SCAN the MAP', async () => {
    const response = await backend.scanMap(0, 0, 1000);
    expect(response.data.elements).toBeInstanceOf(Array);
    expect(response.data.elements.length).toBe(0);
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
