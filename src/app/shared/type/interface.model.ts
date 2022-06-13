import MapboxCircle from 'mapbox-gl-circle';
import { AssignmentType, FactionType, GuildType, LocationType, MarkerType, PopupType, StoreType } from './enum.type';

export interface Faction {
  type: string;
  subtype: string;
  name: string;
  description: string;
  image: string;
  marker: string;
  opposites: Array<Category>;
  adjacents: Array<Category>;
  id: FactionType;
}

export interface Position {
  coords: Coordinates;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Clan {
  fid?: string;
  name: string;
  description: string;
  members: Array<Kingdom>;
  leader: Kingdom;
  power: number;
  image: string;
}

export interface Tree {
  [perk: string]: number;
}

export interface Perk {
  type: string;
  subtype: string;
  faction: Faction;
  id: string;
  name: string;
  description: string;
  image: string;
  sort: number;
  level: number;
  max: number;
  perks: Array<Perk>;
  troopBonus: number;
  goldBonus: number;
  manaBonus: number;
  populationBonus: number;
  constructionBonus: number;
  godBonus: number;
  explorationBonus: number;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  researchBonus: number;
  magicalDefenseBonus: number;
  physicalDefenseBonus: number;
}

export interface Item {
  type: string;
  subtype: string;
  turns: number;
  image: string;
  faction: Faction;
  name: string;
  description: string;
  id: string;
  skills: Array<Skill>;
  families: Array<Family>;
  categories: Array<Category>;
  resistances: Array<Category>;
  units: Array<Unit>;
  resources: Array<Resource>;
  spells: Array<Spell>;
  amount: Array<number>;
  battle: boolean;
  self: boolean;
  multiple: boolean;
  gems: number;
  legendary: boolean;
}

export interface Artifact {
  fid?: string;
  assignment: AssignmentType;
  id: string;
  quantity: number;
  item: Item;
}

export interface Structure {
  type: string;
  subtype: string;
  name: string;
  description: string;
  id: string;
  faction: Faction;
  image: string;
  resources: Array<Resource>;
  turnRatio: number;
  goldCost: number;
  manaCost: number;
  populationCost: number;
  goldProduction: number;
  manaProduction: number;
  populationProduction: number;
  goldMaintenance: number;
  manaMaintenance: number;
  populationMaintenance: number;
  goldCapacity: number;
  manaCapacity: number;
  populationCapacity: number;
  power: number;
}

export interface Building {
  fid?: string;
  id: string;
  quantity: number;
  structure: Structure;
}

export interface Enchantment {
  fid?: string;
  from: Kingdom;
  spell: Spell;
  turns: number;
}

export interface Incantation {
  fid?: string;
  to: Kingdom;
  spell: Spell;
  turns: number;
}

export interface Spell {
  type: string;
  subtype: string;
  name: string;
  description: string;
  id: string;
  image: string;
  faction: Faction;
  skills: Array<Skill>;
  families: Array<Family>;
  categories: Array<Category>;
  resistances: Array<Category>;
  units: Array<Unit>;
  resources: Array<Resource>;
  heroes: Array<Hero>;
  items: Array<Item>;
  level: number;
  amount: Array<number>;
  turnCost: number;
  turnResearch: number;
  turnDuration: number;
  manaCost: number;
  goldMaintenance: number;
  manaMaintenance: number;
  populationMaintenance: number;
  goldProduction: number;
  manaProduction: number;
  populationProduction: number;
  landProduction: number;
  researchBonus: number;
  buildBonus: number;
  physicalDefense: number;
  magicalDefense: number;
  summon: boolean;
  epidemic: boolean;
  dispellable: boolean;
  battle: boolean;
  removes: boolean;
  self: boolean;
  multiple: boolean;
  global: boolean;
  legendary: boolean;
}

export interface Charm {
  fid?: string;
  assignment: AssignmentType;
  completed: boolean;
  id: string;
  spell: Spell;
  turns: number;
}

export interface Resource {
  id: string;
  type: string;
  subtype: string | null;
  faction: Faction;
  name: string;
  description: string;
  sort: number;
  image: string;
  status: string;
  route: string;
  ratio: number | null;
  max: number | null;
}

export interface Supply {
  balance: number;
  id: string;
  max: number;
  quantity: number;
  resource: Resource;
  timestamp: firebase.firestore.Timestamp | null;
}

export interface Guild {
  subtype: string;
  faction: Faction;
  name: string;
  description: string;
  id: GuildType;
  image: string;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  goldBonus: number;
  manaBonus: number;
  populationBonus: number;
  explorationBonus: number;
  constructionBonus: number;
  researchBonus: number;
}

export interface Kingdom {
  fid?: string;
  artifacts?: Array<Artifact>;
  buildings: Array<Building>;
  charms?: Array<Charm>;
  supplies: Array<Supply>;
  troops?: Array<Troop>;
  contracts?: Array<Contract>;
  clan: Clan | null;
  coordinates: Coordinates;
  faction: Faction;
  guild: Guild;
  attacked: firebase.firestore.Timestamp | null;
  guilded: firebase.firestore.Timestamp | null;
  id: string;
  name: string;
  position: any; // TODO
  power: number;
  tree: Perk | null;
}

export interface Unit {
  fid?: string;
  type: string;
  subtype: string;
  name: string;
  description: string;
  id: string;
  image: string;
  faction: Faction;
  categories: Array<Category>;
  resistances: Array<Category>;
  skills: Array<Skill>;
  families: Array<Family>;
  initiative: number;
  attack: number;
  defense: number;
  health: number;
  gold: number;
  goldMaintenance: number;
  manaMaintenance: number;
  populationMaintenance: number;
  power: number;
  level: number;
  amount: Array<number>;
  recruitable: boolean;
  legendary: boolean;
}

export interface Troop extends TroopSort {
  fid?: string;
  id: string;
  quantity: number;
  unit: Unit;
}

export interface TroopSort {
  troopId: string;
  assignment: AssignmentType;
  sort: number;
}

export interface Hero {
  type: string;
  subtype: string;
  faction: Faction;
  name: string;
  description: string;
  id: string;
  image: string;
  skills: Array<Skill>;
  families: Array<Family>;
  categories: Array<Category>;
  resistances: Array<Category>;
  units: Array<Unit>;
  resources: Array<Resource>;
  spells: Array<Spell>;
  attack: number;
  defense: number;
  health: number;
  power: number;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  resurrectionBonus: number;
  exploreBonus: number;
  buildBonus: number;
  researchBonus: number;
  goldProduction: number;
  manaProduction: number;
  populationProduction: number;
  goldMaintenance: number;
  manaMaintenance: number;
  populationMaintenance: number;
  legendary: boolean;
  multiple: boolean;
  battle: boolean;
  self: boolean;
}

export interface Contract {
  fid?: string;
  id: string;
  level: number;
  hero: Hero;
  contractId: string;
  assignment: AssignmentType;
  sort: number;
}

export interface Letter {
  fid?: string;
  read: boolean;
  from: Kingdom;
  subject: string;
  message: string;
  timestamp: firebase.firestore.Timestamp;
  data?: {
    gold?: number;
    gems?: number;
    hero?: Hero;
    item?: Item;
    spell?: Spell;
    unit?: Unit;
    level?: number;
    quantity?: number;
    join?: Hero & { level?: number } | Item & { level?: number } | Spell | Unit;
    logs?: Array<any>; // TODO
    intel?: {
      buildings?: Array<Building>;
      contracts?: Array<Contract>;
      troops?: Array<Troop>;
      supplies?: Array<Supply>;
    }
  };
}

export interface Filter {
  [name: string]: {
    type: 'text' | 'select' | 'timestamp' | 'multiple';
    value: unknown | Array<unknown>;
    options?: Array<unknown>;
  };
}

export interface Family {
  type: string;
  subtype: string | null;
  faction: Faction;
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Category {
  type: string;
  subtype: string;
  faction: Faction;
  id: string;
  name: string;
  description: string;
  image: string;
  meleeResistance: number;
  rangedResistance: number;
  magicResistance: number;
  psychicResistance: number;
  breathResistance: number;
  fireResistance: number;
  poisonResistance: number;
  coldResistance: number;
  lightningResistance: number;
  holyResistance: number;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  initiativeBonus: number;
}

export interface Auction {
  fid?: string;
  name: string;
  gold: number;
  quantity?: number;
  level?: number;
  type: 'troop' | 'charm' | 'artifact' | 'contract';
  item?: Item;
  hero?: Hero;
  spell?: Spell;
  unit?: Unit;
  join?: Item | Hero | Spell | Unit;
  auctioned: firebase.firestore.Timestamp;
}

export interface Attack {
  type: string;
  subtype: string;
  id: string;
  faction: Faction;
  name: string;
  description: string;
  image: string;
}

export interface Pack {
  id: string;
  type: string;
  subtype: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  money: number;
}

export interface Location {
  type: string;
  subtype: string;
  faction: Faction;
  families: string;
  id: LocationType;
  name: string;
  description: string;
  image: string;
}

export interface Quest {
  id: string;
  turns: number;
  location: Location;
  name: string;
  type: LocationType | StoreType | PopupType; // to be extended by Popup
  visited: firebase.firestore.Timestamp;
  artifacts?: Array<Artifact>;
  troops?: Array<Troop>;
  contracts?: Array<Contract>;
}

export interface Store {
  type: string;
  subtype: string;
  image: string;
  name: string;
  description: string;
  id: StoreType;
  faction: Faction;
}

export interface Shop {
  id: string;
  store: Store;
  name: string;
  type: StoreType | LocationType | PopupType; // to be extended with Popup
  visited: firebase.firestore.Timestamp;
  artifacts?: Array<Artifact>;
  troops?: Array<Troop>;
  contracts?: Array<Contract>;
}

export interface Skill {
  type: string;
  subtype: string;
  faction: Faction;
  id: string;
  name: string;
  description: string;
  image: string;
  resurrectionBonus: number;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  initiativeBonus: number;
}

export interface God {
  fid?: string;
  type: string;
  subtype: string;
  id: string;
  name: string;
  description: string;
  image: string;
  faction: Faction;
  units: Array<Unit>;
  items: Array<Item>;
  spells: Array<Spell>;
  gold: number;
  mana: number;
  population: number;
  land: number;
  turn: number;
  gem: number;
  sacrifice: number;
  increment: number;
  legendary: boolean;
  armageddon: boolean;
}

export interface Lang {
  lang: string;
  image: string;
}

export interface Street {
  url: string;
  image: string;
  name: string;
  description: string;
}

export interface District {
  id: string;
  name: string;
  image: string;
  links: Array<Street>;
}

export interface Legend {
  name: string;
  clan: Clan;
  timestamp: firebase.firestore.Timestamp;
}

export interface Deal {
  fid?: string;
  gold: number;
  quantity: number;
  join?: any;
  hero?: Hero;
  item?: Item;
  spell?: Spell;
  unit?: Unit;
}

export interface Reward {
  quantity: number;
  item: Item;
}

export interface Topic {
  surname: string;
  name: string;
  examples: Array<Tome>;
  suffix?: string;
}

export interface Marker {
  id: string;
  name?: string;
  type: MarkerType;
  marker: mapboxgl.Marker;
  circle: MapboxCircle;
  store?: Store;
  location?: Location;
  faction?: Faction;
}

export interface Popup extends Kingdom, Shop, Quest {
  // TODO
}

export interface Tome {
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  subtype?: string;
  image?: string;
  faction?: Faction;
  skills?: Array<Skill>;
  families?: Array<Family>;
  categories?: Array<Category>;
  units?: Array<Unit>;
  resources?: Array<Resource>;
  spells?: Array<Spell>;
  adjacents?: Array<Faction>;
  opposites?: Array<Faction>;
  resistances?: Array<Category>;
  turnRatio?: number;
  goldCost?: number;
  manaCost?: number;
  populationCost?: number;
  goldProduction?: number;
  manaProduction?: number;
  populationProduction?: number;
  goldMaintenance?: number;
  manaMaintenance?: number;
  populationMaintenance?: number;
  goldCapacity?: number;
  manaCapacity?: number;
  populationCapacity?: number;
  power?: number;
  initiative?: number;
  attack?: number;
  defense?: number;
  health?: number;
  gold?: number;
  level?: number;
  amount?: Array<number>;
  recruitable?: boolean;
  join?: any;
  heroes?: Array<Hero>;
  items?: Array<Item>;
  turnCost?: number;
  turnResearch?: number;
  turnDuration?: number;
  landProduction?: number;
  researchBonus?: number;
  buildBonus?: number;
  physicalDefense?: number;
  magicalDefense?: number;
  summon?: boolean;
  epidemic?: boolean;
  dispellable?: boolean;
  battle?: boolean;
  removes?: boolean;
  self?: boolean;
  multiple?: boolean;
  global?: boolean;
  legendary?: boolean;
}

export interface Icon {
  id: string;
  name: string;
  image: string;
}

export interface ApiResponse {
  [name: string]: any; // TODO
}
