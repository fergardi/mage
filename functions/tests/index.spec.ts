import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { resolveBattle } from '../src/index';

const config = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
};
const tester = functions(config, '../credentials/test.json');


describe('API', () => {

  afterAll(() => {
    tester.cleanup();
  })

  it('should GET the UNITS', async () => {
    const units = await admin.firestore().collection('units').get();
    expect(units.docs.length).toBe(65);
  });

  it('should RESOLVE a BATTLE', async () => {
    const batch = admin.firestore().batch();
    const result = await resolveBattle([], [], [], [], [], [], [], [], 'test', batch, 'test', 'test');
    expect(result).toBeTruthy();
  });

});
