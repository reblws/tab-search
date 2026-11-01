// The overlay's one-time tokens (see OVERLAY_REGISTER in protocol.js), as a
// pure value: the background keeps the current one and replaces it with
// what these return.
import { TOKEN_TTL_MS } from './protocol';

const TOKEN = /^[A-Za-z0-9-]{16,64}$/;

// tokens: { [token]: { tabId, at } }
export function registerToken(tokens, { token, tabId, now }) {
  if (!TOKEN.test(String(token)) || !Number.isInteger(tabId)) return tokens;
  const kept = {};
  Object.keys(tokens).forEach((key) => {
    if (now - tokens[key].at < TOKEN_TTL_MS) kept[key] = tokens[key];
  });
  kept[token] = { tabId, at: now };
  return kept;
}

// Returns { valid, tokens }: valid when the token was registered for this
// tab and hasn't expired. A token works once.
export function claimToken(tokens, { token, tabId, now }) {
  const entry = Object.prototype.hasOwnProperty.call(tokens, token) ? tokens[token] : null;
  const rest = Object.assign({}, tokens);
  delete rest[token];
  const valid = !!entry && entry.tabId === tabId && now - entry.at < TOKEN_TTL_MS;
  return { valid, tokens: entry ? rest : tokens };
}
