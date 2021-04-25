import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { applyArtifacts } from './index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('./credentials/test.json')),
};
const tester = functions(config);

describe('API', () => {
  // logs
  let logs: any[] = [];
  // balance
  let balance: any = {
    attackerPower: 0,
    defenderPower: 0,
  };
  // troops
  const attackerUnits: any[] = ['skeleton'];
  const defenderUnits: any[] = ['orc'];
  const attackerTroops: any[] = [];
  const defenderTroops: any[] = [];
  // artifacts
  const attackerItems: any[] = ['agility-potion', 'spider-web']; // haste, slowness
  const defenderItems: any[] = ['fairy-wings']; // flight
  const attackerArtifacts: any[] = [];
  const defenderArtifacts: any[] = [];
  // charms
  const attackerSpells: any[] = [];
  const defenderSpells: any[] = [];
  const attackerCharms: any[] = [];
  const defenderCharms: any[] = [];
  // contracts
  const attackerHeroes: any[] = ['necrophage'];
  const defenderHeroes: any[] = ['orc-king'];
  const attackerContracts: any[] = [];
  const defenderContracts: any[] = [];

  beforeEach(async () => {
    // logs
    logs = [];
    // balance
    balance = {
      attackerPower: 0,
      defenderPower: 0,
    };
    try {
      // troops
      for (const unit of attackerUnits) {
        attackerTroops.push({
          unit: (await admin.firestore().doc(`units/${unit}`).get()).data(),
          quantity: 10000,
        });
      }
      for (const unit of defenderUnits) {
        defenderTroops.push({
          unit: (await admin.firestore().doc(`units/${unit}`).get()).data(),
          quantity: 10000,
        });
      }
      // artifacts
      for (const item of attackerItems) {
        attackerArtifacts.push({
          item: (await admin.firestore().doc(`items/${item}`).get()).data(),
          quantity: 1,
        });
      }
      for (const item of defenderItems) {
        defenderArtifacts.push({
          item: (await admin.firestore().doc(`items/${item}`).get()).data(),
          quantity: 1,
        });
      }
      // charms
      for (const spell of attackerSpells) {
        attackerCharms.push({
          spell: (await admin.firestore().doc(`spells/${spell}`).get()).data(),
        });
      }
      for (const spell of defenderSpells) {
        defenderCharms.push({
          spell: (await admin.firestore().doc(`spells/${spell}`).get()).data(),
          level: 10000,
        });
      }
      // contracts
      for (const hero of attackerHeroes) {
        attackerContracts.push({
          hero: (await admin.firestore().doc(`heroes/${hero}`).get()).data(),
          level: 10,
        });
      }
      for (const hero of defenderHeroes) {
        defenderContracts.push({
          hero: (await admin.firestore().doc(`heroes/${hero}`).get()).data(),
          level: 10,
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(() => {
    tester.cleanup();
  })

  it('should APPLY an ARTIFACT which ADDS an SKILL', () => {
    expect(attackerArtifacts.length).toBe(2);
    expect(attackerArtifacts[0].item.id).toBe('agility-potion');
    expect(attackerArtifacts[1].item.id).toBe('spider-web');
    expect(attackerTroops.length).toBe(1);
    expect(attackerTroops[0].unit.id).toBe('skeleton');
    expect(defenderArtifacts.length).toBe(1);
    expect(defenderArtifacts[0].item.id).toBe('fairy-wings');
    expect(defenderTroops.length).toBe(1);
    expect(defenderTroops[0].unit.id).toBe('orc');
    // attacker -> attacker
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining([expect.objectContaining({ id: 'haste' })]));
    // attacker -> defender
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining([expect.objectContaining({ id: 'slowness' })]));
    // defender -> defender
    expect(defenderTroops[0].unit.skills).toEqual(expect.not.arrayContaining([expect.objectContaining({ id: 'flight' })]));
    // results
    applyArtifacts(logs, attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, balance);
    expect(attackerTroops[0].unit.skills).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'haste' })]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'flight' })]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'slowness' })]));
  });

});
