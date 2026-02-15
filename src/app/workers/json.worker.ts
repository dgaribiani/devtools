/// <reference lib="webworker" />
import { canonicalizeJson, CanonicalizeOptions } from '../tools/json/utils/canonicalize';
import { diffJson, DiffOptions } from '../tools/json/utils/json-diff';

interface WorkerRequest<T = unknown> {
  id: number;
  task: 'format' | 'minify' | 'canonicalize' | 'diff';
  payload: T;
}

interface WorkerResponse<T = unknown> {
  id: number;
  ok: boolean;
  data?: T;
  error?: string;
}

const respond = <T>(message: WorkerResponse<T>) =>
  postMessage(message);

const parseJson = (input: string) => {
  return JSON.parse(input);
};

addEventListener('message', ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    switch (data.task) {
      case 'format': {
        const payload = data.payload as { input: string; indent: number };
        const parsed = parseJson(payload.input);
        const formatted = JSON.stringify(parsed, null, payload.indent);
        respond({ id: data.id, ok: true, data: formatted });
        return;
      }
      case 'minify': {
        const payload = data.payload as { input: string };
        const parsed = parseJson(payload.input);
        const minified = JSON.stringify(parsed);
        respond({ id: data.id, ok: true, data: minified });
        return;
      }
      case 'canonicalize': {
        const payload = data.payload as { input: string; options: CanonicalizeOptions };
        const parsed = parseJson(payload.input);
        const canonical = canonicalizeJson(parsed, payload.options);
        const output = JSON.stringify(canonical, null, 2);
        respond({ id: data.id, ok: true, data: output });
        return;
      }
      case 'diff': {
        const payload = data.payload as { left: string; right: string; options: DiffOptions };
        const left = parseJson(payload.left);
        const right = parseJson(payload.right);
        const diff = diffJson(left, right, payload.options);
        respond({ id: data.id, ok: true, data: diff });
        return;
      }
      default:
        respond({ id: data.id, ok: false, error: 'Unknown task.' });
    }
  } catch (error) {
    respond({
      id: data.id,
      ok: false,
      error: error instanceof Error ? error.message : 'Worker error'
    });
  }
});
