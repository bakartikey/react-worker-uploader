import transformTemplate from '../templates/transformTemplate';

const parseCsv = (text: string, delimiter = ',', lineBreak = '\n'): any[] => {
  const rows = text.split(lineBreak).map((line) => line.split(delimiter));
  const headers = rows.shift();
  return rows.map((row) => {
    return headers.reduce((obj, key, index) => {
      obj[key] = row[index];
      return obj;
    }, {} as Record<string, any>);
  });
};

self.onmessage = async (e) => {
  try {
    const { file, type, options = {} } = e.data;
    const text = await file.text();
    const { delimiter, lineBreak } = options;

    const parsed = type === 'json' ? JSON.parse(text) : parseCsv(text, delimiter, lineBreak);

    let result = parsed;
    try {
      result = transformAndValidate(parsed);
    } catch (transformError) {
      self.postMessage({ type: 'error', error: `Transform Error: ${(transformError as Error).message}` });
      return;
    }

    self.postMessage({ type: 'success', data: result });
  } catch (err) {
    self.postMessage({ type: 'error', error: `Parsing Error: ${(err as Error).message}` });
  }
};
