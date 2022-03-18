import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions-test';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-b1c51.firebaseio.com',
  projectId: 'mage-b1c51',
  credential: admin.credential.cert(require('../credentials/test.json')),
};

export const tester = functions(config);
