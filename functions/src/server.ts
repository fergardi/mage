// tslint:disable: no-void-expression
import * as cors from 'cors';
import * as express from 'express';
import * as ash from 'express-async-handler';
import * as backend from './index';

// express
const server = express();
server.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
server.use(express.json());

// endpoints
server.get('/kingdom/:kingdomId/explore/:turns', ash(async (req: any, res: any) => res.json(await backend.exploreLands(req.params.kingdomId, parseInt(req.params.turns)))));
server.get('/kingdom/:kingdomId/charge/:turns', ash(async (req: any, res: any) => res.json(await backend.chargeMana(req.params.kingdomId, parseInt(req.params.turns)))));
server.get('/kingdom/:kingdomId/tax/:turns', ash(async (req: any, res: any) => res.json(await backend.taxGold(req.params.kingdomId, parseInt(req.params.turns)))));
server.get('/kingdom/:kingdomId/army/:unitId/recruit/:quantity', ash(async (req: any, res: any) => res.json(await backend.recruitUnit(req.params.kingdomId, req.params.unitId, parseInt(req.params.quantity)))));
server.delete('/kingdom/:kingdomId/army/:troopId/disband/:quantity', ash(async (req: any, res: any) => res.json(await backend.disbandTroop(req.params.kingdomId, req.params.troopId, parseInt(req.params.quantity)))));
server.patch('/kingdom/:kingdomId/army', ash(async (req: any, res: any) => res.json(await backend.assignArmy(req.params.kingdomId, req.body.army))));
server.post('/kingdom/:kingdomId/battle/:battleId/target/:targetId', ash(async (req: any, res: any) => res.json(await backend.battleKingdom(req.params.kingdomId, req.params.battleId, req.params.targetId))));
server.patch('/kingdom/:kingdomId/sorcery/:charmId/research/:turns', ash(async (req: any, res: any) => res.json(await backend.researchCharm(req.params.kingdomId, req.params.charmId, parseInt(req.params.turns)))));
server.post('/kingdom/:kingdomId/sorcery/:charmId/conjure/:targetId', ash(async (req: any, res: any) => res.json(await backend.conjureCharm(req.params.kingdomId, req.params.charmId, req.params.targetId))));
server.delete('/kingdom/:kingdomId/sorcery/:artifactId/activate/:targetId', ash(async (req: any, res: any) => res.json(await backend.activateArtifact(req.params.kingdomId, req.params.artifactId, req.params.targetId))));
server.patch('/kingdom/:kingdomId/sorcery/charm/:charmId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await backend.assignCharm(req.params.kingdomId, req.params.charmId, parseInt(req.params.assignmentId)))));
server.patch('/kingdom/:kingdomId/sorcery/artifact/:artifactId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await backend.assignArtifact(req.params.kingdomId, req.params.artifactId, parseInt(req.params.assignmentId)))));
server.patch('/kingdom/:kingdomId/auction/:auctionId/bid/:gold', ash(async (req: any, res: any) => res.json(await backend.bidAuction(req.params.kingdomId, req.params.auctionId, parseInt(req.params.gold)))));
server.patch('/kingdom/:kingdomId/temple/:godId/offer/:resource', ash(async (req: any, res: any) => res.json(await backend.offerGod(req.params.kingdomId, req.params.godId, parseInt(req.params.resource)))));
server.delete('/kingdom/:kingdomId/temple/:enchantmentId/dispel', ash(async (req: any, res: any) => res.json(await backend.dispelIncantation(req.params.kingdomId, req.params.enchantmentId))));
server.delete('/kingdom/:kingdomId/temple/:enchantmentId/break', ash(async (req: any, res: any) => res.json(await backend.breakEnchantment(req.params.kingdomId, req.params.enchantmentId))));
server.patch('/kingdom/:kingdomId/city/:buildingId/build/:quantity', ash(async (req: any, res: any) => res.json(await backend.buildStructure(req.params.kingdomId, req.params.buildingId, parseInt(req.params.quantity)))));
server.patch('/kingdom/:kingdomId/city/:buildingId/demolish/:quantity', ash(async (req: any, res: any) => res.json(await backend.demolishStructure(req.params.kingdomId, req.params.buildingId, parseInt(req.params.quantity)))));
server.patch('/kingdom/:kingdomId/tavern/:contractId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await backend.assignContract(req.params.kingdomId, req.params.contractId, parseInt(req.params.assignmentId)))));
server.delete('/kingdom/:kingdomId/tavern/:contractId/discharge', ash(async (req: any, res: any) => res.json(await backend.dischargeContract(req.params.kingdomId, req.params.contractId))));
server.get('/kingdom/:kingdomId/emporium/:itemId', ash(async (req: any, res: any) => res.json(await backend.buyEmporium(req.params.kingdomId, req.params.itemId))));
server.post('/kingdom/:kingdomId/archive', ash(async (req: any, res: any) => res.json(await backend.sendLetter(req.params.kingdomId, req.body.subject, req.body.message, req.body.fromId))));
server.patch('/kingdom/:kingdomId/archive/:letterId', ash(async (req: any, res: any) => res.json(await backend.readLetter(req.params.kingdomId, req.params.letterId))));
server.delete('/kingdom/:kingdomId/archive', ash(async (req: any, res: any) => res.json(await backend.removeLetters(req.params.kingdomId, req.body.letterIds))));
server.patch('/kingdom/:kingdomId/guild/:guildId', ash(async (req: any, res: any) => res.json(await backend.favorGuild(req.params.kingdomId, req.params.guildId))));
server.patch('/kingdom/:kingdomId/clan/:clanId/join', ash(async (req: any, res: any) => res.json(await backend.joinClan(req.params.kingdomId, req.params.clanId))));
server.patch('/kingdom/:kingdomId/clan/:clanId/leave', ash(async (req: any, res: any) => res.json(await backend.leaveClan(req.params.kingdomId, req.params.clanId))));
server.get('/kingdom/:kingdomId/world/shop/:shopId/:collectionId/:dealId', ash(async (req: any, res: any) => res.json(await backend.tradeDeal(req.params.kingdomId, req.params.shopId, req.params.collectionId, req.params.dealId))));
server.post('/kingdom/:kingdomId/world/quest/:questId', ash(async (req: any, res: any) => res.json(await backend.adventureQuest(req.params.kingdomId, req.params.questId))));
server.put('/kingdom/:kingdomId/tree', ash(async (req: any, res: any) => res.json(await backend.plantTree(req.params.kingdomId, req.body.tree, req.body.gems))));
server.post('/world/kingdom', ash(async (req: any, res: any) => res.json(await backend.createKingdom(req.body.kingdomId, req.body.factionId, req.body.name, parseFloat(req.body.latitude), parseFloat(req.body.longitude)))));
server.put('/world/auction', ash(async (req: any, res: any) => res.json(await backend.refreshAuctions())));
server.put('/world/clan', ash(async (req: any, res: any) => res.json(await backend.foundateClan(req.body.kingdomId, req.body.name, req.body.description, req.body.image))));
server.put('/world/shop', ash(async (req: any, res: any) => res.json(await backend.checkShop(req.body.fid, parseFloat(req.body.latitude), parseFloat(req.body.longitude), req.body.storeType, req.body.name))));
server.put('/world/quest', ash(async (req: any, res: any) => res.json(await backend.checkQuest(req.body.fid, parseFloat(req.body.latitude), parseFloat(req.body.longitude), req.body.locationType, req.body.name))));
server.post('/world/map', ash(async (req: any, res: any) => res.json(await backend.populateMap(parseFloat(req.body.latitude), parseFloat(req.body.longitude)))));
// error handler
server.use((err: any, req: any, res: any, next: any) => res.status(500).json({ status: 500, error: err.message }));

export default server;
