export interface PollingRunner {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export class PlaceholderPollingRunner implements PollingRunner {
  async start(): Promise<void> {
    throw new Error("Polling runtime is not implemented yet.");
  }

  async stop(): Promise<void> {
    return Promise.resolve();
  }
}
