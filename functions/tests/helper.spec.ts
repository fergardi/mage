import 'jest';
import { random, calculate, MAX_TURNS } from '../index';
import * as moment from 'moment';

describe('HELPER', () => {

  it('should RETURN a RANDOM number', () => {
    const n = random(0, 10);
    expect(typeof n).toBe('number');
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(10);
  });

  it('should CALCULATE the TURNS since TIMESTAMP', () => {
    const now = moment.now();
    const oneMinuteAgo = moment().subtract(1, 'minute').subtract(1, 'second');
    expect(calculate(oneMinuteAgo, now, MAX_TURNS, 3)).toBe(0);
    const oneHourAgo = moment().subtract(1, 'hour').subtract(1, 'second');
    expect(calculate(oneHourAgo, now, MAX_TURNS, 3)).toBe(20);
    const oneDayAgo = moment().subtract(1, 'day').subtract(1, 'second');
    expect(calculate(oneDayAgo, now, MAX_TURNS, 3)).toBe(300);
    const oneWeekAgo = moment().subtract(1, 'week').subtract(1, 'second');
    expect(calculate(oneWeekAgo, now, MAX_TURNS, 3)).toBe(MAX_TURNS);
  });

});
