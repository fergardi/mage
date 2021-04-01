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

  createKingdom(kingdomId: string, factionId: string, name: string, latitude: number, longitude: number) {
    return this.httpClient.post(environment.functions.url + `/world/kingdom`, {
      kingdomId: kingdomId,
      name: name,
      factionId: factionId,
      latitude: latitude,
      longitude: longitude,
    }).toPromise();
  }

  exploreLand(kingdomId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/explore/${turns}`).toPromise();
  }

  chargeMana(kingdomId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/charge/${turns}`).toPromise();
  }

  taxGold(kingdomId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/tax/${turns}`).toPromise();
  }

  recruitUnit(kingdomId: string, unitId: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/army/${unitId}/recruit/${quantity}`).toPromise();
  }

  disbandTroop(kingdomId: string, troopId: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/army/${troopId}/disband/${quantity}`).toPromise();
  }

  dischargeContract(kingdomId: string, contractId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/tavern/${contractId}/discharge`).toPromise();
  }

  researchCharm(kingdomId: string, charmId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/${charmId}/research/${turns}`).toPromise();
  }

  conjureCharm(kingdomId: string, charmId: string, targetId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/${charmId}/conjure/${targetId}`).toPromise();
  }

  activateArtifact(kingdomId: string, artifactId: string, targetId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/${artifactId}/activate/${targetId}`).toPromise();
  }

  bidAuction(kingdomId: string, auctionId: string, gold: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/auction/${auctionId}/bid/${gold}`).toPromise();
  }

  offerGod(kingdomId: string, godId: string, gold: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/temple/${godId}/offer/${gold}`).toPromise();
  }

  buildStructure(kingdomId: string, buildingId: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/city/${buildingId}/build/${quantity}`).toPromise();
  }

  assignContract(kingdomId: string, contractId: string, assignmentId: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/tavern/${contractId}/assign/${assignmentId}`).toPromise();
  }

  assignArmy(kingdomId: string, army: any[]) {
    return this.httpClient.post(environment.functions.url + `/kingdom/${kingdomId}/army`, { army: army }).toPromise();
  }

  buyEmporium(kingdomId: string, itemId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/emporium/${itemId}`).toPromise();
  }

  battleKingdom(kingdomId: string, targetId: string, battleId: number ) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/battle/${battleId}/target/${targetId}`).toPromise();
  }

  mapQuery(query: string, bbox: string) {
    const form = new URLSearchParams();
    form.set('data', query);
    form.set('bbox', bbox);
    return this.httpClient.post(environment.overpass.url, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).toPromise();
  }

  addKingdom(kingdomId: string, factionId: FactionType, latitude: number, longitude: number, name: string) {
    return this.httpClient.post(environment.functions.url + '/world/kingdom', {
      kingdomId: kingdomId,
      factionId: factionId,
      latitude: latitude,
      longitude: longitude,
      name: name,
    }).toPromise();
  }

  addShop(fid: string, storeType: StoreType, latitude?: number, longitude?: number, name?: string) {
    return this.httpClient.put(environment.functions.url + '/world/shop', {
      fid: fid,
      storeType: storeType,
      latitude: latitude,
      longitude: longitude,
      name: name,
    }).toPromise();
  }

  addQuest(fid: string, locationType: LocationType, latitude?: number, longitude?: number, name?: string) {
    return this.httpClient.put(environment.functions.url + '/world/quest', {
      fid: fid,
      locationType: locationType,
      latitude: latitude,
      longitude: longitude,
      name: name,
    }).toPromise();
  }

  refreshAuction() {
    return this.httpClient.put(environment.functions.url + `/kingdom/auction`, undefined).toPromise();
  }

  sendLetter(kingdomId: string, subject: string, message: string, fromId: string) {
    return this.httpClient.post(environment.functions.url + `/kingdom/${kingdomId}/archive`, {
      subject: subject,
      message: message,
      fromId: fromId,
    }).toPromise();
  }

  readLetter(kingdomId: string, letterId: string) {
    return this.httpClient.patch(environment.functions.url + `/kingdom/${kingdomId}/archive/${letterId}`, undefined).toPromise();
  }

  removeLetters(kingdomId: string, letterIds: string[]) { // https://stackoverflow.com/a/63135636/2477303
    return this.httpClient.request('delete', environment.functions.url + `/kingdom/${kingdomId}/archive`, {
      body: {
        letterIds: letterIds,
      },
    }).toPromise();
  }

  favorGuild(kingdomId: string, guildId: string) {
    return this.httpClient.patch(environment.functions.url + `/kingdom/${kingdomId}/guild/${guildId}`, undefined).toPromise();
  }

  foundateClan(kingdomId: string, name: string, description: string, image: string) {
    return this.httpClient.post(environment.functions.url + `/world/clan`, {
      kingdomId: kingdomId,
      name: name,
      description: description,
      image: image,
    }).toPromise();
  }

  joinClan(kingdomId: string, clanId: string) {
    return this.httpClient.patch(environment.functions.url + `/kingdom/${kingdomId}/clan/${clanId}`, undefined).toPromise();
  }

  leaveClan(kingdomId: string, clanId: string) { // https://stackoverflow.com/a/63135636/2477303
    return this.httpClient.request('delete', environment.functions.url + `/kingdom/${kingdomId}/clan/${clanId}`, undefined).toPromise();
  }

  assignCharm(kingdomId: string, charmId: string, assignmentId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/charm/${charmId}/assign/${assignmentId}`).toPromise();
  }

  assignArtifact(kingdomId: string, artifactId: string, assignmentId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/artifact/${artifactId}/assign/${assignmentId}`).toPromise();
  }

}
