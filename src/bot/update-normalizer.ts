export type NormalizedBotUpdate = {
  kind: "unsupported";
  raw: unknown;
};

export function normalizeBotUpdate(update: unknown): NormalizedBotUpdate {
  return {
    kind: "unsupported",
    raw: update
  };
}
