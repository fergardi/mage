import { TurnPipe } from './turn.pipe';

describe('TurnPipe', () => {
  it('should CREATE the INSTANCE', () => {
    const pipe = new TurnPipe();
    expect(pipe).toBeTruthy();
  });
});
