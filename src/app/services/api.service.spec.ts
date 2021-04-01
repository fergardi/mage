import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';
import { StoreType, LocationType } from '../shared/type/common.type';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should CREATE the INSTANCE a KINGDOM', (async () => {
    const request = service.createKingdom('bot', 'faction', 'name', 0, 0);
    const mock = httpMock.expectOne(environment.functions.url + `/world/kingdom`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('POST');
    expect(response).toBe(null);
  }));

  it('should EXPLORE some LANDS', (async () => {
    const request = service.exploreLand('bot', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/explore/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should CHARGE some MANA', (async () => {
    const request = service.chargeMana('bot', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/charge/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should TAX some GOLD', (async () => {
    const request = service.taxGold('bot', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/tax/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should RECRUIT some UNITS', (async () => {
    const request = service.recruitUnit('bot', 'unit', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/army/unit/recruit/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should DISBAND some UNITS', (async () => {
    const request = service.disbandTroop('bot', 'troop', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/army/troop/disband/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should RESEARCH a CHARM', (async () => {
    const request = service.researchCharm('bot', 'charm', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/sorcery/charm/research/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should CONJURE a CHARM', (async () => {
    const request = service.conjureCharm('bot', 'charm', 'bot');
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/sorcery/charm/conjure/bot`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should ACTIVATE an ARTIFACT', (async () => {
    const request = service.activateArtifact('bot', 'artifact', 'bot');
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/sorcery/artifact/activate/bot`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should BID an AUCTION', (async () => {
    const request = service.bidAuction('bot', 'charm', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/auction/charm/bid/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should OFFER a GOD', (async () => {
    const request = service.offerGod('bot', 'god', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/temple/god/offer/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should BUILD a STRUCTURE', (async () => {
    const request = service.buildStructure('bot', 'node', 10);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/city/node/build/10`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should ASSIGN a CONTRACT', (async () => {
    const request = service.assignContract('bot', 'contract', 0);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/tavern/contract/assign/0`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should ASSIGN an ARMY', (async () => {
    const request = service.assignArmy('bot', []);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/army`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('POST');
    expect(response).toBe(null);
  }));

  it('should BUY an ARTIFACT', (async () => {
    const request = service.buyEmporium('bot', 'item');
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/emporium/item`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should BATTLE a KINGDOM', (async () => {
    const request = service.battleKingdom('bot1', 'bot2', 0);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot1/battle/0/target/bot2`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('GET');
    expect(response).toBe(null);
  }));

  it('should QUERY a MAP', (async () => {
    const request = service.mapQuery('query', 'bbox');
    const mock = httpMock.expectOne(environment.overpass.url);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('POST');
    expect(response).toBe(null);
  }));

  it('should ADD a SHOP', (async () => {
    const request = service.addShop('shop', StoreType.SORCERER, 0, 0, 'test');
    const mock = httpMock.expectOne(environment.functions.url + `/world/shop`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('PUT');
    expect(response).toBe(null);
  }));

  it('should ADD a QUEST', (async () => {
    const request = service.addQuest('shop', LocationType.GRAVEYARD, 0, 0, 'test');
    const mock = httpMock.expectOne(environment.functions.url + `/world/quest`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('PUT');
    expect(response).toBe(null);
  }));

  it('should REFRESH the AUCTION', (async () => {
    const request = service.refreshAuction();
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/auction`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('PUT');
    expect(response).toBe(null);
  }));

  it('should READ the LETTER', (async () => {
    const request = service.readLetter('bot', 'letter');
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/archive/letter`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('PATCH');
    expect(response).toBe(null);
  }));

  it('should REMOVE the LETTERS', (async () => {
    const request = service.removeLetters('bot', []);
    const mock = httpMock.expectOne(environment.functions.url + `/kingdom/bot/archive`);
    mock.flush(null);
    const response = await request;
    expect(mock.request.method).toEqual('DELETE');
    expect(response).toBe(null);
  }));

});
