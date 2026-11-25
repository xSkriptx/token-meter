# token-meter

Day 7. Why does a long AI chat get more expensive per message even if every message you type is the same size? A tiny **model** of the cost of a chat when you call a language model through an API. Zero dependencies, Node 18+.

This is a model, not a measurement of any real service. It uses no real prices and does not name any provider.

## The idea

A model has no memory between calls. Each call sends the instructions, the conversation so far, and your new message. So the input grows every turn, even when every message is the same size.

## Assumptions (change them in `meter.js`)

- 200 instruction tokens sent every call.
- You type 60 tokens per message and get a 250 token reply.
- A token is a chunk of text, very roughly three quarters of a word. Real tokenizers differ, so real counts will too.
- "Cost units": 1 per input token, 5 per output token (illustrative ratio), and 0.1 per input token if the repeated part is cached (illustrative, and only if your provider caches).

## Results (`npm run simulate`, 20 message chat)

| | Tokens |
|---|---|
| Message 1 input | 260 |
| Message 20 input | 6,150 (23.7x message 1) |
| Whole chat, input processed (full history) | 64,100 |
| What you typed and read | 6,200 (the input is 10.3x that) |
| Whole chat, keep only the last 4 messages | 16,670 (74% less) |

The growth is linear per message, so it adds up to **quadratic** over the whole chat.

## Caveats

- Trimming the history cuts the cost, but the model then forgets what was trimmed. Summaries can help and cost tokens too. This model does not score answer quality.
- Some providers discount repeated input (caching). That lowers the price, not the growth.
- Real chat apps often manage history, limits and caching for you. This models a direct API call with the full history each time.
- Message sizes are my choices. Real messages vary a lot (pasted files can be thousands of tokens by themselves).

```
npm test
npm run simulate
```

MIT licensed.
