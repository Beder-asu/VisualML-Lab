import { csvLimits, parseDatasetCsv, type DatasetWorkerResponse } from '../utils/datasetCsv';

self.onmessage = async ({ data: file }: MessageEvent<File>) => {
    const reply = (message: DatasetWorkerResponse) => self.postMessage(message);
    try {
        if (file.size > csvLimits.bytes) throw new Error('Choose a CSV no larger than 2 MB.');
        let text: string;
        try {
            text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
        } catch {
            throw new Error('The file could not be read as UTF-8. Save it as UTF-8 CSV and try again.');
        }
        reply({ dataset: parseDatasetCsv(file.name, text) });
    } catch (error) {
        reply({ error: error instanceof Error ? error.message : 'Could not read this CSV.' });
    }
};
