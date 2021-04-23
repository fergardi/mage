import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { BattleType, resolveBattle } from '../src/index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

describe('API', () => {

  afterAll(() => {
    tester.cleanup();
  })

  it('should RESOLVE an ADVENTURE', async () => {
    // troops
    const attackerUnits = ['skeleton'];
    const defenderUnits = ['orc'];
    const attackerTroops = [];
    const defenderTroops = [];
    for (let i = 0; i < attackerUnits.length; i++) {
      attackerTroops.push({
        unit: (await admin.firestore().doc(`units/${attackerUnits[i]}`).get()).data(),
        quantity: 10000,
      });
    }
    for (let i = 0; i < defenderUnits.length; i++) {
      defenderTroops.push({
        unit: (await admin.firestore().doc(`units/${defenderUnits[i]}`).get()).data(),
        quantity: 10000,
      });
    }
    // contracts
    const attackerHeroes = ['necrophage'];
    const defenderHeroes = ['orc-king'];
    const attackerContracts = [];
    const defenderContracts = [];
    for (let i = 0; i < attackerHeroes.length; i++) {
      attackerContracts.push({
        hero: (await admin.firestore().doc(`heroes/${attackerHeroes[i]}`).get()).data(),
        level: 10,
      });
    }
    for (let i = 0; i < defenderHeroes.length; i++) {
      defenderContracts.push({
        hero: (await admin.firestore().doc(`heroes/${defenderHeroes[i]}`).get()).data(),
        level: 10,
      });
    }
    // spells
    const logs: any[] = [];
    const victory = await resolveBattle(BattleType.ADVENTURE, logs, attackerContracts, attackerTroops, [], [], defenderContracts, defenderTroops, [], [], undefined, undefined, undefined, undefined);
    console.log(logs);
    expect(victory).toBe(true);
  });

});
