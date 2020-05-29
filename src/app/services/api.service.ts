import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BattleType } from '../kingdom/census/battle.component';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  createKingdom(kingdomId: string, factionId: string, name:string, latitude: number, longitude: number) {
    return this.httpClient.post(environment.functions.url + `/kingdom`, {
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
    return this.httpClient.post(environment.functions.url + `/kingdom/${kingdomId}/army`, {
      army: army
    }).toPromise();
  }

  buyEmporium(kingdomId: string, itemId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/emporium/${itemId}`).toPromise();
  }

  battleKingdom(kingdomId: string, targetId: string, battleId: number ) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/battle/${battleId}/target/${targetId}`).toPromise();
  }

}
