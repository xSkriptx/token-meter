const assert = require('assert');
const { run, historyTokens, DEFAULTS } = require('./meter');

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };

t('turn 1 sends only instructions + your message', () => {
  const r = run({}, { name: 'full' });
  assert.strictEqual(r.first, DEFAULTS.systemTokens + DEFAULTS.userTokens);   // 260
});
t('turn k sends the whole history (full)', () => {
  const r = run({}, { name: 'full' });
  assert.strictEqual(r.last, 200 + 19 * 310 + 60);                             // 6150
  assert.strictEqual(r.perTurnInput[1], 200 + 310 + 60);
});
t('input grows by one exchange per turn (linear per turn, so quadratic in total)', () => {
  const r = run({}, { name: 'full' });
  for (let i = 1; i < r.perTurnInput.length; i++) assert.strictEqual(r.perTurnInput[i] - r.perTurnInput[i - 1], 310);
});
t('total input over n turns matches the closed form', () => {
  const r = run({ turns: 10 }, { name: 'full' });
  const closed = 10 * 260 + 310 * (10 * 9 / 2);
  assert.strictEqual(r.input, closed);
});
t('window strategy stops growing', () => {
  const r = run({}, { name: 'window', keep: 4 });
  assert.strictEqual(r.perTurnInput[19], r.perTurnInput[10]);                  // flat once the window is full
  assert.ok(r.input < run({}, { name: 'full' }).input);
});
t('window of 4 messages = last 2 exchanges', () => {
  assert.strictEqual(historyTokens(10, { ...DEFAULTS }, { name: 'window', keep: 4 }), 2 * (60 + 250));
});
t('output tokens do not grow with history', () => {
  assert.strictEqual(run({}, { name: 'full' }).output, 20 * 250);
});
t('caching only helps if the provider caches: units drop but tokens do not', () => {
  const r = run({}, { name: 'full' });
  assert.ok(r.unitsCached < r.units);
  assert.strictEqual(r.input, run({}, { name: 'full' }).input);
});
t('unknown strategy throws', () => { assert.throws(() => run({}, { name: 'nope' })); });

console.log(`\n${n} tests passed`);
