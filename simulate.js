const fs = require('fs');
const { run } = require('./meter');

const full = run({}, { name: 'full' });
const win = run({}, { name: 'window', keep: 4 });
const f = (n) => Math.round(n).toLocaleString('en-US');

const out = {
  turns: full.params.turns,
  per_turn_input_full: full.perTurnInput,
  first_turn_input: full.first, last_turn_input: full.last, growth_x: +(full.last / full.first).toFixed(1),
  full: { input_total: full.input, output_total: full.output, typed_and_read: full.typedAndRead, input_vs_typed_x: +(full.input / full.typedAndRead).toFixed(1), units: full.units, units_if_cached: Math.round(full.unitsCached) },
  window4: { input_total: win.input, last_turn_input: win.last, saved_input_pct: Math.round((1 - win.input / full.input) * 100), units: win.units },
};
fs.writeFileSync(__dirname + '/results.json', JSON.stringify(out, null, 2));

console.log(`20 message chat, ${full.params.userTokens} tokens you type + ${full.params.replyTokens} reply, ${full.params.systemTokens} instruction tokens\n`);
console.log(`turn 1 input:  ${f(full.first)} tokens`);
console.log(`turn 20 input: ${f(full.last)} tokens  (${out.growth_x}x turn 1)`);
console.log(`whole chat, full history: ${f(full.input)} input tokens processed, vs ${f(full.typedAndRead)} typed and read (${out.full.input_vs_typed_x}x)`);
console.log(`keep only last 4 messages: ${f(win.input)} input tokens (${out.window4.saved_input_pct}% less), turn 20 input ${f(win.last)}`);
console.log(`cost units (illustrative 5x output): full ${f(full.units)}, window ${f(win.units)}, full but cached ${f(full.unitsCached)}`);
