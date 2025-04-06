import { useRef, useCallback, useState } from 'react';
// @ts-ignore
import FileParserWorker from '../workers/fileParser.worker.ts?worker';

type ParsedResult = any;

type UseWorkerUploaderProps = {
  onParsed: (result: ParsedResult) => void;
  onError?: (err: string) => void;
  onStart?: () => void;
  onFinish?: () => void;
  fileType?: 'csv' | 'json';
  allowedExtensions?: string[];
  maxFileSizeMB?: number;
  parseOptions?: {
    delimiter?: string;
    lineBreak?: string;
  };
  debug?: boolean;
};

export function useWorkerUploader({
  onParsed,
  onError,
  onStart,
  onFinish,
  fileType = 'csv',
  allowedExtensions = ['csv'],
  maxFileSizeMB = 10,
  parseOptions = { delimiter: ',', lineBreak: '\n' },
  debug = false,
}: UseWorkerUploaderProps) {
  const workerRef = useRef<Worker | null>(null);
  const [loading, setLoading] = useState(false);

  const parseFile = useCallback((file: File) => {
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      onError?.(`File type .${extension} is not allowed`);
      return;
    }

    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      onError?.(`File exceeds max size of ${maxFileSizeMB}MB`);
      return;
    }

    setLoading(true);
    onStart?.();

    const worker = new FileParserWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      setLoading(false);
      onFinish?.();

      if (debug) console.debug('[Worker Message]', e.data);

      if (e.data.type === 'success') {
        onParsed(e.data.data);
      } else {
        onError?.(e.data.error);
      }

      worker.terminate();
    };

    if (debug) console.debug('[Posting to Worker]', { fileType, parseOptions });

    worker.postMessage({
      file,
      type: fileType,
      options: parseOptions,
    });
  }, [allowedExtensions, fileType, maxFileSizeMB, parseOptions, onParsed, onError, onStart, onFinish, debug]);

  return { parseFile, loading };
}
