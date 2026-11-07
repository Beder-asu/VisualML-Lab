import Papa from 'papaparse';

export const csvLimits = { bytes: 2 * 1024 * 1024, rows: 10_000, columns: 50 };
const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export type DatasetColumn = {
    name: string;
    missing: number;
    numbers: (number | null)[] | null;
};

export type ImportedDataset = {
    name: string;
    rows: string[][];
    columns: DatasetColumn[];
};

function rejectBareQuotes(text: string): void {
    // Papa Parse accepts quotes embedded in unquoted text. CSV requires escaping those fields.
    let quoted = false;
    let fieldStart = 0;
    let record = 1;
    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        if (character === '"') {
            if (quoted && text[index + 1] === '"') {
                index += 1;
                continue;
            }
            if (!quoted && index !== fieldStart) {
                throw new Error(`CSV record ${record}: Enclose fields that contain quotes in double quotes and double each inner quote.`);
            }
            quoted = !quoted;
        } else if (!quoted && (character === ',' || character === '\r' || character === '\n')) {
            fieldStart = index + 1;
            if (character === '\n' || (character === '\r' && text[index + 1] !== '\n')) record += 1;
        }
    }
}

export function parseDatasetCsv(name: string, text: string): ImportedDataset {
    const source = text.replace(/^\uFEFF/, '');
    rejectBareQuotes(source);
    const { data, errors } = Papa.parse<string[]>(source, {
        delimiter: ',',
        skipEmptyLines: true,
    });
    const parseError = errors[0];
    if (parseError) {
        const location = parseError.row === undefined ? 'CSV' : `CSV record ${parseError.row + 1}`;
        throw new Error(`${location}: ${parseError.message}`);
    }
    const [header, ...rows] = data;
    if (!header || rows.length === 0) throw new Error('Include a header and at least one data row.');
    if (header.length > csvLimits.columns) throw new Error('Use a CSV with 50 columns or fewer.');
    if (rows.length > csvLimits.rows) throw new Error('Use a CSV with 10,000 data rows or fewer.');
    const names = header.map(value => value.trim());
    if (names.some(value => !value)) throw new Error('Give every column a name in the header row.');
    if (new Set(names).size !== names.length) throw new Error('Use a different name for each column.');

    const ragged = rows.findIndex(row => row.length !== names.length);
    if (ragged >= 0) {
        throw new Error(`CSV record ${ragged + 2} has ${rows[ragged].length} fields. Expected ${names.length}.`);
    }

    const columns = names.map((name, index): DatasetColumn => {
        let missing = 0;
        let numeric = true;
        const numbers = rows.map(row => {
            const value = row[index].trim();
            if (!value) {
                missing += 1;
                return null;
            }
            const number = Number(value);
            if (numberPattern.test(value) && Number.isFinite(number)) return number;
            numeric = false;
            return null;
        });
        return { name, missing, numbers: numeric && missing < rows.length ? numbers : null };
    });
    return { name, rows, columns };
}

export type DatasetWorkerResponse =
    | { dataset: ImportedDataset }
    | { error: string };
