import { Injectable } from '@angular/core';

export type JsonWorkerTask = 'format' | 'minify' | 'canonicalize' | 'diff';

interface WorkerRequest<T = unknown> {
  id: number;
  task: JsonWorkerTask;
  payload: T;
}

interface WorkerResponse<T = unknown> {
  id: number;
  ok: boolean;
  data?: T;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class JsonWorkerService {
  private worker: Worker;
  private counter = 0;
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }>();

  constructor() {
    this.worker = new Worker(new URL('../../workers/json.worker', import.meta.url), { type: 'module' });
    this.worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      const handler = this.pending.get(data.id);
      if (!handler) {
        return;
      }
      this.pending.delete(data.id);
      if (data.ok) {
        handler.resolve(data.data);
      } else {
        handler.reject(new Error(data.error || 'Worker error'));
      }
    };
  }

  request<TPayload, TResult>(task: JsonWorkerTask, payload: TPayload): Promise<TResult> {
    const id = ++this.counter;
    const message: WorkerRequest<TPayload> = { id, task, payload };
    return new Promise<TResult>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (value) => resolve(value as TResult),
        reject
      });
      this.worker.postMessage(message);
    });
  }
}
