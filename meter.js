// A small model of what a chat costs when you call a language model through an API.
// A model has no memory between calls: every call sends the instructions plus the conversation so far, plus your new message.
// So the input grows with every turn, even if every message you type is the same size.
//
// Everything is in TOKENS (a token is a chunk of text, very roughly three quarters of a word; real tokenizers differ).
// No real prices are used. "Cost units" use an illustrative ratio you can change: output tokens cost more than input tokens.

const DEFAULTS = {
  turns: 20,
  systemTokens: 200,     // instructions sent every time
  userTokens: 60,        // each message you type
  replyTokens: 250,      // each reply you get
  outputCostRatio: 5,    // illustrative: 1 output token costs 5 "units", 1 input token costs 1
  cachedInputRatio: 0.1, // illustrative: a repeated (cached) input token costs 0.1 units, if the provider caches
};

// How much history goes in on turn k (k starts at 1)?
//   full:   everything so far
//   window: only the last `keep` messages (user + reply count separately)
function historyTokens(k, p, strategy) {
  const exchange = p.userTokens + p.replyTokens;
  if (strategy.name === 'full') return (k - 1) * exchange;
  if (strategy.name === 'window') {
    const msgs = [];                                         // one entry per past message, oldest first
    for (let i = 1; i < k; i++) msgs.push(p.userTokens, p.replyTokens);
    return msgs.slice(-strategy.keep).reduce((a, b) => a + b, 0);
  }
  throw new Error('unknown strategy ' + strategy.name);
}

function run(opts = {}, strategy = { name: 'full' }) {
  const p = { ...DEFAULTS, ...opts };
  const perTurnInput = [];
  let input = 0, cachedInput = 0;
  for (let k = 1; k <= p.turns; k++) {
    const hist = historyTokens(k, p, strategy);
    const tin = p.systemTokens + hist + p.userTokens;
    perTurnInput.push(tin);
    input += tin;
    cachedInput += p.systemTokens + hist;                    // best case: everything repeated from the last call is cached
  }
  const output = p.turns * p.replyTokens;
  const typedAndRead = p.turns * (p.userTokens + p.replyTokens);
  const units = input + output * p.outputCostRatio;
  const unitsCached = (input - cachedInput) + cachedInput * p.cachedInputRatio + output * p.outputCostRatio;
  return { perTurnInput, input, output, typedAndRead, units, unitsCached, first: perTurnInput[0], last: perTurnInput[p.turns - 1], params: p };
}

module.exports = { DEFAULTS, run, historyTokens };
