import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
    const cache = await service.get(CollectionType.PACKS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the GUILDS', async () => {
    const cache = await service.get(CollectionType.GUILDS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the ATTACKS', async () => {
    const cache = await service.get(CollectionType.ATTACKS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the SKILLS', async () => {
    const cache = await service.get(CollectionType.SKILLS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the FACTIONS', async () => {
    const cache = await service.get(CollectionType.FACTIONS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the UNITS', async () => {
    const cache = await service.get(CollectionType.UNITS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the FAMILIES', async () => {
    const cache = await service.get(CollectionType.FAMILIES);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the SPELLS', async () => {
    const cache = await service.get(CollectionType.SPELLS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the STRUCTURES', async () => {
    const cache = await service.get(CollectionType.STRUCTURES);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the CATEGORIES', async () => {
    const cache = await service.get(CollectionType.CATEGORIES);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the GODS', async () => {
    const cache = await service.get(CollectionType.GODS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the HEROES', async () => {
    const cache = await service.get(CollectionType.HEROES);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the RESOURCES', async () => {
    const cache = await service.get(CollectionType.RESOURCES);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the ITEMS', async () => {
    const cache = await service.get(CollectionType.ITEMS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the STORES', async () => {
    const cache = await service.get(CollectionType.STORES);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the LOCATIONS', async () => {
    const cache = await service.get(CollectionType.LOCATIONS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

  it('should GET the PERKS', async () => {
    const cache = await service.get(CollectionType.PERKS);
    expect(cache).toBeInstanceOf(Array);
    expect(cache.length).toBe(0);
  });

});
