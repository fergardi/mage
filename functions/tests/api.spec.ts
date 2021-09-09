import 'jest';
import * as request from 'supertest';
import * as backend from '../src/index';
import server from '../src/server';

describe('API', () => {

  it('should CALL the FAKE and RETURN the 404', async () => {
    const res = await request(server)
    .get('/test')
    .send();
    expect(res.statusCode).toEqual(404);
  });

  it('should CALL the REAL and RETURN the 500', async () => {
    jest.spyOn(backend, 'exploreLands').mockRejectedValue(new Error('test'));
    const res = await request(server)
    .get('/kingdom/:kingdomId/explore/:turns')
    .send();
    expect(res.statusCode).toEqual(500);
  });

  it('should CALL the EXPLORELANDS and RETURN the 200', async () => {
    jest.spyOn(backend, 'exploreLands').mockResolvedValue(null);
    const res = await request(server)
    .get('/kingdom/:kingdomId/explore/:turns')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.exploreLands).toHaveBeenCalled();
  });

  it('should CALL the CHARGEMANA and RETURN the 200', async () => {
    jest.spyOn(backend, 'chargeMana').mockResolvedValue(null);
    const res = await request(server)
    .get('/kingdom/:kingdomId/charge/:turns')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.chargeMana).toHaveBeenCalled();
  });

  it('should CALL the TAXGOLD and RETURN the 200', async () => {
    jest.spyOn(backend, 'taxGold').mockResolvedValue(null);
    const res = await request(server)
    .get('/kingdom/:kingdomId/tax/:turns')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.taxGold).toHaveBeenCalled();
  });

  it('should CALL the RECRUITUNIT and RETURN the 200', async () => {
    jest.spyOn(backend, 'recruitUnit').mockResolvedValue(null);
    const res = await request(server)
    .get('/kingdom/:kingdomId/army/:unitId/recruit/:quantity')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.recruitUnit).toHaveBeenCalled();
  });

  it('should CALL the DISBANDTROOP and RETURN the 200', async () => {
    jest.spyOn(backend, 'disbandTroop').mockResolvedValue(null);
    const res = await request(server)
    .delete('/kingdom/:kingdomId/army/:troopId/disband/:quantity')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.disbandTroop).toHaveBeenCalled();
  });

  it('should CALL the ASSIGNARMY and RETURN the 200', async () => {
    jest.spyOn(backend, 'assignArmy').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/army')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.assignArmy).toHaveBeenCalled();
  });

  it('should CALL the BATTLEKINGDOM and RETURN the 200', async () => {
    jest.spyOn(backend, 'battleKingdom').mockResolvedValue();
    const res = await request(server)
    .post('/kingdom/:kingdomId/battle/:battleId/target/:targetId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.battleKingdom).toHaveBeenCalled();
  });

  it('should CALL the RESEARCHCHARM and RETURN the 200', async () => {
    jest.spyOn(backend, 'researchCharm').mockResolvedValue(null);
    const res = await request(server)
    .patch('/kingdom/:kingdomId/sorcery/:charmId/research/:turns')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.researchCharm).toHaveBeenCalled();
  });

  it('should CALL the CONJURECHARM and RETURN the 200', async () => {
    jest.spyOn(backend, 'conjureCharm').mockResolvedValue();
    const res = await request(server)
    .post('/kingdom/:kingdomId/sorcery/:charmId/conjure/:targetId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.conjureCharm).toHaveBeenCalled();
  });

  it('should CALL the ACTIVATEARTIFACT and RETURN the 200', async () => {
    jest.spyOn(backend, 'activateArtifact').mockResolvedValue(null);
    const res = await request(server)
    .delete('/kingdom/:kingdomId/sorcery/:artifactId/activate/:targetId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.activateArtifact).toHaveBeenCalled();
  });

  it('should CALL the ASSIGNCHARM and RETURN the 200', async () => {
    jest.spyOn(backend, 'assignCharm').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/sorcery/charm/:charmId/assign/:assignmentId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.assignCharm).toHaveBeenCalled();
  });

  it('should CALL the ASSIGNARTIFACT and RETURN the 200', async () => {
    jest.spyOn(backend, 'assignArtifact').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/sorcery/artifact/:artifactId/assign/:assignmentId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.assignArtifact).toHaveBeenCalled();
  });

  it('should CALL the BIDAUCTION and RETURN the 200', async () => {
    jest.spyOn(backend, 'bidAuction').mockResolvedValue(null);
    const res = await request(server)
    .patch('/kingdom/:kingdomId/auction/:auctionId/bid/:gold')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.bidAuction).toHaveBeenCalled();
  });

  it('should CALL the OFFERGOD and RETURN the 200', async () => {
    jest.spyOn(backend, 'offerGod').mockResolvedValue(null);
    const res = await request(server)
    .patch('/kingdom/:kingdomId/temple/:godId/offer/:resource')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.offerGod).toHaveBeenCalled();
  });

  it('should CALL the DISPELINCANTATION and RETURN the 200', async () => {
    jest.spyOn(backend, 'dispelIncantation').mockResolvedValue();
    const res = await request(server)
    .delete('/kingdom/:kingdomId/temple/:enchantmentId/dispel')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.dispelIncantation).toHaveBeenCalled();
  });

  it('should CALL the BREAKENCHANTMENT and RETURN the 200', async () => {
    jest.spyOn(backend, 'breakEnchantment').mockResolvedValue(null);
    const res = await request(server)
    .delete('/kingdom/:kingdomId/temple/:enchantmentId/break')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.breakEnchantment).toHaveBeenCalled();
  });

  it('should CALL the BUILDSTRUCTURE and RETURN the 200', async () => {
    jest.spyOn(backend, 'buildStructure').mockResolvedValue(null);
    const res = await request(server)
    .patch('/kingdom/:kingdomId/city/:buildingId/build/:quantity')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.buildStructure).toHaveBeenCalled();
  });

  it('should CALL the DEMOLISHSTRUCTURE and RETURN the 200', async () => {
    jest.spyOn(backend, 'demolishStructure').mockResolvedValue(null);
    const res = await request(server)
    .patch('/kingdom/:kingdomId/city/:buildingId/demolish/:quantity')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.demolishStructure).toHaveBeenCalled();
  });

  it('should CALL the ASSIGNCONTRACT and RETURN the 200', async () => {
    jest.spyOn(backend, 'assignContract').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/tavern/:contractId/assign/:assignmentId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.assignContract).toHaveBeenCalled();
  });

  it('should CALL the DISCHARGECONTRACT and RETURN the 200', async () => {
    jest.spyOn(backend, 'dischargeContract').mockResolvedValue();
    const res = await request(server)
    .delete('/kingdom/:kingdomId/tavern/:contractId/discharge')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.dischargeContract).toHaveBeenCalled();
  });

  it('should CALL the BUYEMPORIUM and RETURN the 200', async () => {
    jest.spyOn(backend, 'buyEmporium').mockResolvedValue(null);
    const res = await request(server)
    .get('/kingdom/:kingdomId/emporium/:itemId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.buyEmporium).toHaveBeenCalled();
  });

  it('should CALL the SENDLETTER and RETURN the 200', async () => {
    jest.spyOn(backend, 'sendLetter').mockResolvedValue();
    const res = await request(server)
    .post('/kingdom/:kingdomId/archive')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.sendLetter).toHaveBeenCalled();
  });

  it('should CALL the READLETTER and RETURN the 200', async () => {
    jest.spyOn(backend, 'readLetter').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/archive/:letterId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.readLetter).toHaveBeenCalled();
  });

  it('should CALL the REMOVELETTERS and RETURN the 200', async () => {
    jest.spyOn(backend, 'removeLetters').mockResolvedValue();
    const res = await request(server)
    .delete('/kingdom/:kingdomId/archive')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.removeLetters).toHaveBeenCalled();
  });

  it('should CALL the FAVORGUILD and RETURN the 200', async () => {
    jest.spyOn(backend, 'favorGuild').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/guild/:guildId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.favorGuild).toHaveBeenCalled();
  });

  it('should CALL the JOINCLAN and RETURN the 200', async () => {
    jest.spyOn(backend, 'joinClan').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/clan/:clanId/join')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.joinClan).toHaveBeenCalled();
  });

  it('should CALL the LEAVECLAN and RETURN the 200', async () => {
    jest.spyOn(backend, 'leaveClan').mockResolvedValue();
    const res = await request(server)
    .patch('/kingdom/:kingdomId/clan/:clanId/leave')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.leaveClan).toHaveBeenCalled();
  });

  it('should CALL the TRADEDEAL and RETURN the 200', async () => {
    jest.spyOn(backend, 'tradeDeal').mockResolvedValue();
    const res = await request(server)
    .get('/kingdom/:kingdomId/world/shop/:shopId/:collectionId/:dealId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.tradeDeal).toHaveBeenCalled();
  });

  it('should CALL the ADVENTUREQUEST and RETURN the 200', async () => {
    jest.spyOn(backend, 'adventureQuest').mockResolvedValue();
    const res = await request(server)
    .post('/kingdom/:kingdomId/world/quest/:questId')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.adventureQuest).toHaveBeenCalled();
  });

  it('should CALL the PLANTTREE and RETURN the 200', async () => {
    jest.spyOn(backend, 'plantTree').mockResolvedValue();
    const res = await request(server)
    .put('/kingdom/:kingdomId/tree')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.plantTree).toHaveBeenCalled();
  });

  it('should CALL the CREATEKINGDOM and RETURN the 200', async () => {
    jest.spyOn(backend, 'createKingdom').mockResolvedValue(null);
    const res = await request(server)
    .post('/world/kingdom')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.createKingdom).toHaveBeenCalled();
  });

  it('should CALL the REFRESHAUCTIONS and RETURN the 200', async () => {
    jest.spyOn(backend, 'refreshAuctions').mockResolvedValue();
    const res = await request(server)
    .put('/world/auction')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.refreshAuctions).toHaveBeenCalled();
  });

  it('should CALL the FOUNDATECLAN and RETURN the 200', async () => {
    jest.spyOn(backend, 'foundateClan').mockResolvedValue();
    const res = await request(server)
    .put('/world/clan')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.foundateClan).toHaveBeenCalled();
  });

  it('should CALL the CHECKSHOP and RETURN the 200', async () => {
    jest.spyOn(backend, 'checkShop').mockResolvedValue();
    const res = await request(server)
    .put('/world/shop')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.checkShop).toHaveBeenCalled();
  });

  it('should CALL the CHECKQUEST and RETURN the 200', async () => {
    jest.spyOn(backend, 'checkQuest').mockResolvedValue();
    const res = await request(server)
    .put('/world/quest')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.checkQuest).toHaveBeenCalled();
  });

  it('should CALL the POPULATEMAP and RETURN the 200', async () => {
    jest.spyOn(backend, 'populateMap').mockResolvedValue();
    const res = await request(server)
    .post('/world/map')
    .send();
    expect(res.statusCode).toEqual(200);
    expect(backend.populateMap).toHaveBeenCalled();
  });

});
