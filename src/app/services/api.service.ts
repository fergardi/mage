import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  explore(kingdomId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/explore/${turns}`).toPromise();
  }

  charge(kingdomId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/charge/${turns}`).toPromise();
  }

  tax(kingdomId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/tax/${turns}`).toPromise();
  }

  recruit(kingdomId: string, unitId: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/army/${unitId}/recruit/${quantity}`).toPromise();
  }

  disband(kingdomId: string, troopId: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/army/${troopId}/disband/${quantity}`).toPromise();
  }

  research(kingdomId: string, charmId: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/${charmId}/research/${turns}`).toPromise();
  }

  conjure(kingdomId: string, charmId: string, targetId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/${charmId}/conjure/${targetId}`).toPromise();
  }

  activate(kingdomId: string, artifactId: string, targetId: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/sorcery/${artifactId}/activate/${targetId}`).toPromise();
  }

  bid(kingdomId: string, auctionId: string, gold: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/auction/${auctionId}/bid/${gold}`).toPromise();
  }

  offer(kingdomId: string, godId: string, gold: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/temple/${godId}/offer/${gold}`).toPromise();
  }

  build(kingdomId: string, buildingId: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdomId}/city/${buildingId}/build/${quantity}`).toPromise();
  }

}
