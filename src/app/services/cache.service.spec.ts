import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestoreStub } from 'src/stubs';
import { CollectionType } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ],
    });
    service = TestBed.inject(CacheService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should GET the FACTIONS', async () => {
    await service.get(CollectionType.PACKS);
  });

  it('should GET the GUILDS', async () => {
    await service.get(CollectionType.GUILDS);
  });

  it('should GET the ATTACKS', async () => {
    await service.get(CollectionType.ATTACKS);
  });

  it('should GET the SKILLS', async () => {
    await service.get(CollectionType.SKILLS);
  });

  it('should GET the FACTIONS', async () => {
    await service.get(CollectionType.FACTIONS);
  });

  it('should GET the UNITS', async () => {
    await service.get(CollectionType.UNITS);
  });

  it('should GET the FAMILIES', async () => {
    await service.get(CollectionType.FAMILIES);
  });

  it('should GET the SPELLS', async () => {
    await service.get(CollectionType.SPELLS);
  });

  it('should GET the STRUCTURES', async () => {
    await service.get(CollectionType.STRUCTURES);
  });

  it('should GET the CATEGORIES', async () => {
    await service.get(CollectionType.CATEGORIES);
  });

  it('should GET the GODS', async () => {
    await service.get(CollectionType.GODS);
  });

  it('should GET the HEROES', async () => {
    await service.get(CollectionType.HEROES);
  });

  it('should GET the RESOURCES', async () => {
    await service.get(CollectionType.RESOURCES);
  });

  it('should GET the ITEMS', async () => {
    await service.get(CollectionType.ITEMS);
  });

  it('should GET the STORES', async () => {
    await service.get(CollectionType.STORES);
  });

  it('should GET the LOCATIONS', async () => {
    await service.get(CollectionType.LOCATIONS);
  });

});
