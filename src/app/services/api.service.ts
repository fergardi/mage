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

  explore(kingdom: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdom}/explore/${turns}`).toPromise();
  }

  charge(kingdom: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdom}/charge/${turns}`).toPromise();
  }

  tax(kingdom: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdom}/tax/${turns}`).toPromise();
  }

  recruit(kingdom: string, unit: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdom}/army/${unit}/recruit/${quantity}`).toPromise();
  }

  disband(kingdom: string, troop: string, quantity: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdom}/army/${troop}/disband/${quantity}`).toPromise();
  }

  research(kingdom: string, charm: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdom}/sorcery/${charm}/research/${turns}`).toPromise();
  }

  conjure(kingdom: string, charm: string, target: string) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${kingdom}/sorcery/${charm}/target/${target}`).toPromise();
  }

}
