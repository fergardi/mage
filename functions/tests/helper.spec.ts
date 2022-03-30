import 'jest';
import { random, calculateTurns, randomType } from '../src/index';
import * as moment from 'moment';
import { AssignmentType, AuctionType, BattleType, BonusType, CategoryType, KingdomType, LocationType, MarkerType, MAX_TURNS, RewardType, StoreType, SupplyType, TargetType } from '../src/config';

describe('Helpers', () => {

  it('should RETURN a RANDOM number', () => {
    const min = 0;
    const max = 10;
    const n = random(min, max);
    expect(typeof n).toBe('number');
    expect(n).toBeGreaterThanOrEqual(min);
    expect(n).toBeLessThanOrEqual(max);
  });

  it.each([
    ['kingdom', KingdomType],
    ['bonus', BonusType],
    ['target', TargetType],
    ['battle', BattleType],
    ['store', StoreType],
    ['category', CategoryType],
    ['location', LocationType],
    ['auction', AuctionType],
    ['supply', SupplyType],
    ['assignment', AssignmentType],
    ['marker', MarkerType],
    ['reward', RewardType],
  ])('should RETURN a RANDOM "%s"', (name, type) => {
    const t = randomType(type);
    expect(Object.values(type).includes(t)).toBeTruthy();
  });
  
  it('should CALCULATE the TURNS since TIMESTAMP', () => {
    const now = moment.now();
    const oneMinuteAgo = moment().subtract(1, 'minute').subtract(1, 'second');
    expect(calculateTurns(oneMinuteAgo, now, MAX_TURNS, 3)).toBe(0);
    const oneHourAgo = moment().subtract(1, 'hour').subtract(1, 'second');
    expect(calculateTurns(oneHourAgo, now, MAX_TURNS, 3)).toBe(20);
    const oneDayAgo = moment().subtract(1, 'day').subtract(1, 'second');
    expect(calculateTurns(oneDayAgo, now, MAX_TURNS, 3)).toBe(300);
    const oneWeekAgo = moment().subtract(1, 'week').subtract(1, 'second');
    expect(calculateTurns(oneWeekAgo, now, MAX_TURNS, 3)).toBe(MAX_TURNS);
  });

});
