import 'jest';
import { random, calculate } from '../index';
import * as moment from 'moment';

describe('HELPER', () => {

  it('should RETURN a RANDOM number', () => {
    const n = random(0, 10);
    expect(typeof n).toBe('number');
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(10);
  });

  it('should CALCULATE the TURNS from TIME', () => {
    const now = moment.now();
    const oneMinuteAgo = moment().subtract(1, 'minutes').subtract(1, 'seconds');
    expect(calculate(oneMinuteAgo, now, 300, 3)).toBe(0);
    const oneHourAgo = moment().subtract(1, 'hours').subtract(1, 'seconds');
    expect(calculate(oneHourAgo, now, 300, 3)).toBe(20);
    const oneDayAgo = moment().subtract(1, 'days').subtract(1, 'seconds');
    expect(calculate(oneDayAgo, now, 300, 3)).toBe(300);
    const oneWeekAgo = moment().subtract(1, 'weeks').subtract(1, 'seconds');
    expect(calculate(oneWeekAgo, now, 300, 3)).toBe(300);
  });

});
