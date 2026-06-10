import type {
  AchievementClient,
  AchievementClientMutationResult,
  AchievementClientSnapshot,
} from './types';

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface RestAchievementClientConfig {
  baseUrl: string;
  fetcher?: Fetcher;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  credentials?: RequestCredentials;
  timeout?: number;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

export class RestAchievementClient implements AchievementClient {
  private baseUrl: string;
  private fetcher: Fetcher;
  private headers?: RestAchievementClientConfig['headers'];
  private credentials?: RequestCredentials;
  private timeout?: number;

  constructor(config: RestAchievementClientConfig) {
    this.baseUrl = trimTrailingSlash(config.baseUrl);
    this.fetcher = config.fetcher || fetch.bind(globalThis);
    this.headers = config.headers;
    this.credentials = config.credentials;
    this.timeout = config.timeout;
  }

  async getSnapshot(): Promise<AchievementClientSnapshot> {
    return this.request<AchievementClientSnapshot>('', { method: 'GET' });
  }

  async track(metric: string, value: unknown): Promise<AchievementClientMutationResult> {
    return this.request<AchievementClientMutationResult>('/track', {
      method: 'POST',
      body: JSON.stringify({ metric, value }),
    });
  }

  async trackMany(metrics: Record<string, unknown>): Promise<AchievementClientMutationResult> {
    return this.request<AchievementClientMutationResult>('/track', {
      method: 'POST',
      body: JSON.stringify({ metrics }),
    });
  }

  async increment(metric: string, amount: number = 1): Promise<AchievementClientMutationResult> {
    return this.request<AchievementClientMutationResult>('/increment', {
      method: 'POST',
      body: JSON.stringify({ metric, amount }),
    });
  }

  async event(name: string, payload?: unknown): Promise<AchievementClientMutationResult> {
    return this.request<AchievementClientMutationResult>('/event', {
      method: 'POST',
      body: JSON.stringify({ name, payload }),
    });
  }

  async reset(): Promise<AchievementClientSnapshot> {
    return this.request<AchievementClientSnapshot>('/reset', { method: 'POST' });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const controller = this.timeout ? new AbortController() : undefined;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), this.timeout)
      : undefined;

    try {
      const response = await this.fetcher(`${this.baseUrl}${path}`, {
        ...init,
        credentials: this.credentials,
        headers: {
          'Content-Type': 'application/json',
          ...(await this.resolveHeaders()),
          ...init.headers,
        },
        signal: controller?.signal,
      });

      if (!response.ok) {
        throw new Error(`Achievement request failed: HTTP ${response.status}`);
      }

      return await response.json() as T;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private async resolveHeaders(): Promise<HeadersInit> {
    if (!this.headers) {
      return {};
    }

    return typeof this.headers === 'function' ? this.headers() : this.headers;
  }
}

export const createRestAchievementClient = (
  config: RestAchievementClientConfig
): AchievementClient => new RestAchievementClient(config);

