/// <reference lib="webworker" />
import { diffLines } from 'diff';

interface WorkerRequest<T = unknown> {
  id: number;
  task: 'diff-lines';
  payload: T;
}

interface WorkerResponse<T = unknown> {
  id: number;
  ok: boolean;
  data?: T;
  error?: string;
}

addEventListener('message', ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    if (data.task === 'diff-lines') {
      const payload = data.payload as { left: string; right: string };
      const diff = diffLines(payload.left, payload.right);
      const result = diff.map(part => ({
        added: part.added ?? false,
        removed: part.removed ?? false,
        value: part.value
      }));
      postMessage({ id: data.id, ok: true, data: result } satisfies WorkerResponse);
      return;
    }
    postMessage({ id: data.id, ok: false, error: 'Unknown task.' } satisfies WorkerResponse);
  } catch (error) {
    postMessage({
      id: data.id,
      ok: false,
      error: error instanceof Error ? error.message : 'Worker error'
    } satisfies WorkerResponse);
  }
});
