import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { StoreType, LocationType, FactionType } from 'src/app/shared/type/common.type';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  createKingdom(kingdomId: string, factionId: string, name: string, latitude: number, longitude: number): Promise<any> {
    return this.httpClient.post(`${environment.functions.url}/world/kingdom`, {
      kingdomId: kingdomId,
      name: name,
      factionId: factionId,
      latitude: latitude,
      longitude: longitude,
    }).toPromise();
  }

  exploreLand(kingdomId: string, turns: number): Promise<any> {
    return this.httpClient.get(`${environment.functions.url}/kingdom/${kingdomId}/explore/${turns}`).toPromise();
  }

  chargeMana(kingdomId: string, turns: number): Promise<any> {
    return this.httpClient.get(`${environment.functions.url}/kingdom/${kingdomId}/charge/${turns}`).toPromise();
  }

  taxGold(kingdomId: string, turns: number): Promise<any> {
    return this.httpClient.get(`${environment.functions.url}/kingdom/${kingdomId}/tax/${turns}`).toPromise();
  }

  recruitUnit(kingdomId: string, unitId: string, quantity: number): Promise<any> {
    return this.httpClient.get(`${environment.functions.url}/kingdom/${kingdomId}/army/${unitId}/recruit/${quantity}`).toPromise();
  }

  disbandTroop(kingdomId: string, troopId: string, quantity: number): Promise<any> {
    return this.httpClient.delete(`${environment.functions.url}/kingdom/${kingdomId}/army/${troopId}/disband/${quantity}`, undefined).toPromise();
  }

  dischargeContract(kingdomId: string, contractId: string): Promise<any> {
    return this.httpClient.delete(`${environment.functions.url}/kingdom/${kingdomId}/tavern/${contractId}/discharge`, undefined).toPromise();
  }

  researchCharm(kingdomId: string, charmId: string, turns: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/sorcery/${charmId}/research/${turns}`, undefined).toPromise();
  }

  conjureCharm(kingdomId: string, charmId: string, targetId: string): Promise<any> {
    return this.httpClient.post(`${environment.functions.url}/kingdom/${kingdomId}/sorcery/${charmId}/conjure/${targetId}`, undefined).toPromise();
  }

  activateArtifact(kingdomId: string, artifactId: string, targetId: string): Promise<any> {
    return this.httpClient.request('delete', `${environment.functions.url}/kingdom/${kingdomId}/sorcery/${artifactId}/activate/${targetId}`, undefined).toPromise();
  }

  bidAuction(kingdomId: string, auctionId: string, gold: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/auction/${auctionId}/bid/${gold}`, undefined).toPromise();
  }

  offerGod(kingdomId: string, godId: string, gold: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/temple/${godId}/offer/${gold}`, undefined).toPromise();
  }

  buildStructure(kingdomId: string, buildingId: string, quantity: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/city/${buildingId}/build/${quantity}`, undefined).toPromise();
  }

  demolishStructure(kingdomId: string, buildingId: string, quantity: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/city/${buildingId}/demolish/${quantity}`, undefined).toPromise();
  }

  assignContract(kingdomId: string, contractId: string, assignmentId: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/tavern/${contractId}/assign/${assignmentId}`, undefined).toPromise();
  }

  assignArmy(kingdomId: string, army: any[]): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/army`, {
      army: army,
    }).toPromise();
  }

  buyEmporium(kingdomId: string, itemId: string): Promise<any> {
    return this.httpClient.get(`${environment.functions.url}/kingdom/${kingdomId}/emporium/${itemId}`).toPromise();
  }

  battleKingdom(kingdomId: string, targetId: string, battleId: number ): Promise<any> {
    return this.httpClient.post(`${environment.functions.url}/kingdom/${kingdomId}/battle/${battleId}/target/${targetId}`, undefined).toPromise();
  }

  populateMap(latitude: number, longitude: number): Promise<any> {
    return this.httpClient.post(`${environment.functions.url}/world/map`, {
      latitude: latitude,
      longitude: longitude,
    }).toPromise();
  }

  addKingdom(kingdomId: string, factionId: FactionType, latitude: number, longitude: number, name: string): Promise<any> {
    return this.httpClient.post(`${environment.functions.url}/world/kingdom`, {
      kingdomId: kingdomId,
      factionId: factionId,
      latitude: latitude,
      longitude: longitude,
      name: name,
    }).toPromise();
  }

  addShop(fid: string, storeType: StoreType, latitude?: number, longitude?: number, name?: string): Promise<any> {
    return this.httpClient.put(`${environment.functions.url}/world/shop`, {
      fid: fid,
      storeType: storeType,
      latitude: latitude,
      longitude: longitude,
      name: name,
    }).toPromise();
  }

  addQuest(fid: string, locationType: LocationType, latitude?: number, longitude?: number, name?: string): Promise<any> {
    return this.httpClient.put(`${environment.functions.url}/world/quest`, {
      fid: fid,
      locationType: locationType,
      latitude: latitude,
      longitude: longitude,
      name: name,
    }).toPromise();
  }

  refreshAuction(): Promise<any> {
    return this.httpClient.put(`${environment.functions.url}/world/auction`, undefined).toPromise();
  }

  sendLetter(kingdomId: string, subject: string, message: string, fromId: string): Promise<any> {
    return this.httpClient.post(`${environment.functions.url}/kingdom/${kingdomId}/archive`, {
      subject: subject,
      message: message,
      fromId: fromId,
    }).toPromise();
  }

  readLetter(kingdomId: string, letterId: string): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/archive/${letterId}`, undefined).toPromise();
  }

  removeLetters(kingdomId: string, letterIds: string[]): Promise<any> {
    return this.httpClient.delete(`${environment.functions.url}/kingdom/${kingdomId}/archive`, {
      body: {
        letterIds: letterIds,
      },
    }).toPromise();
  }

  favorGuild(kingdomId: string, guildId: string): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/guild/${guildId}`, undefined).toPromise();
  }

  foundateClan(kingdomId: string, name: string, description: string, image: string): Promise<any> {
    return this.httpClient.put(`${environment.functions.url}/world/clan`, {
      kingdomId: kingdomId,
      name: name,
      description: description,
      image: image,
    }).toPromise();
  }

  joinClan(kingdomId: string, clanId: string): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/clan/${clanId}/join`, undefined).toPromise();
  }

  leaveClan(kingdomId: string, clanId: string): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/clan/${clanId}/leave`, undefined).toPromise();
  }

  assignCharm(kingdomId: string, charmId: string, assignmentId: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/sorcery/charm/${charmId}/assign/${assignmentId}`, undefined).toPromise();
  }

  assignArtifact(kingdomId: string, artifactId: string, assignmentId: number): Promise<any> {
    return this.httpClient.patch(`${environment.functions.url}/kingdom/${kingdomId}/sorcery/artifact/${artifactId}/assign/${assignmentId}`, undefined).toPromise();
  }

  dispelIncantation(kingdomId: string, incantationId: string): Promise<any> {
    return this.httpClient.delete(`${environment.functions.url}/kingdom/${kingdomId}/temple/${incantationId}/dispel`, undefined).toPromise();
  }

  breakEnchantment(kingdomId: string, enchantmentId: string): Promise<any> {
    return this.httpClient.delete(`${environment.functions.url}/kingdom/${kingdomId}/temple/${enchantmentId}/break`, undefined).toPromise();
  }

  tradeDeal(kingdomId: string, shopId: string, collectionId: string, dealId: string): Promise<any> {
    return this.httpClient.get(`${environment.functions.url}/kingdom/${kingdomId}/world/shop/${shopId}/${collectionId}/${dealId}`).toPromise();
  }

  adventureQuest(kingdomId: string, questId: string): Promise<any> {
    return this.httpClient.post(`${environment.functions.url}/kingdom/${kingdomId}/world/quest/${questId}`, undefined).toPromise();
  }

  plantTree(kingdomId: string, tree: any, gems: number): Promise<any> {
    return this.httpClient.put(`${environment.functions.url}/kingdom/${kingdomId}/tree`, {
      tree: tree,
      gems: gems,
    }).toPromise();
  }

}
