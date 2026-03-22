/**
 * math.js — Lightweight matrix/vector utilities (NumPy replacement)
 * Used by all ML model ports.
 */

// ---------- Creation ----------

function zeros(n) {
  return new Float64Array(n);
}

function zeros2d(rows, cols) {
  return Array.from({ length: rows }, () => new Float64Array(cols));
}

function ones(n) {
  const arr = new Float64Array(n);
  arr.fill(1);
  return arr;
}

function full(n, value) {
  const arr = new Float64Array(n);
  arr.fill(value);
  return arr;
}

function full2d(rows, cols, value) {
  return Array.from({ length: rows }, () => {
    const row = new Float64Array(cols);
    row.fill(value);
    return row;
  });
}

function eye(n) {
  const m = zeros2d(n, n);
  for (let i = 0; i < n; i++) m[i][i] = 1;
  return m;
}

// ---------- Shape helpers ----------

function shape(A) {
  if (!Array.isArray(A) && !(A instanceof Float64Array)) return [];
  const rows = A.length;
  if (rows === 0) return [0];
  if (Array.isArray(A[0]) || A[0] instanceof Float64Array) return [rows, A[0].length];
  return [rows];
}

function col(A, j) {
  return A.map(row => row[j]);
}

// ---------- Arithmetic ----------

function add(a, b) {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + b[i];
  return out;
}

function sub(a, b) {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] - b[i];
  return out;
}

function scale(a, s) {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] * s;
  return out;
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// ---------- Matrix ops ----------

/** Prepend a column of ones to a 2D matrix */
function prependOnes(X) {
  const [m, n] = shape(X);
  return X.map(row => {
    const newRow = new Float64Array(n + 1);
    newRow[0] = 1;
    newRow.set(row, 1);
    return newRow;
  });
}

/** Matrix-vector multiply: A (m×n) * v (n) → result (m) */
function matvec(A, v) {
  const m = A.length;
  const out = new Float64Array(m);
  for (let i = 0; i < m; i++) out[i] = dot(A[i], v);
  return out;
}

/** Transpose(A) * v  →  result (n), where A is m×n, v is m */
function matTvec(A, v) {
  const [m, n] = shape(A);
  const out = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    let s = 0;
    for (let i = 0; i < m; i++) s += A[i][j] * v[i];
    out[j] = s;
  }
  return out;
}

// ---------- Stats ----------

function sum(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s;
}

function mean(a) {
  return sum(a) / a.length;
}

function variance(a) {
  const m = mean(a);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - m) ** 2;
  return s / a.length;
}

function max(a) {
  let m = -Infinity;
  for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i];
  return m;
}

function argmax(a) {
  let mi = 0;
  for (let i = 1; i < a.length; i++) if (a[i] > a[mi]) mi = i;
  return mi;
}

// ---------- Array utilities ----------

function unique(arr) {
  return [...new Set(arr)].sort((a, b) => a - b);
}

function uniqueFloat(arr) {
  const s = new Set();
  for (let i = 0; i < arr.length; i++) s.add(arr[i]);
  return [...s].sort((a, b) => a - b);
}

/** Count occurrences → { value: count } */
function counter(arr) {
  const c = {};
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    c[v] = (c[v] || 0) + 1;
  }
  return c;
}

/** Return the value with the highest count */
function mode(arr) {
  const c = counter(arr);
  let best = null, bestCount = -1;
  for (const [val, cnt] of Object.entries(c)) {
    if (cnt > bestCount) { bestCount = cnt; best = Number(val); }
  }
  return best;
}

/** Random integer in [0, max) */
function randInt(max) {
  return Math.floor(Math.random() * max);
}

/** Random choice of `size` indices from [0, n), with or without replacement */
function randomChoice(n, size, replace = false) {
  if (replace) {
    return Array.from({ length: size }, () => randInt(n));
  }
  // Fisher-Yates partial shuffle
  const pool = Array.from({ length: n }, (_, i) => i);
  for (let i = 0; i < size; i++) {
    const j = i + randInt(n - i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}

/** Select rows from a 2D array */
function selectRows(A, indices) {
  return indices.map(i => A[i]);
}

/** Select specific columns from a 2D array */
function selectCols(A, colIndices) {
  return A.map(row => {
    const newRow = new Float64Array(colIndices.length);
    for (let j = 0; j < colIndices.length; j++) newRow[j] = row[colIndices[j]];
    return newRow;
  });
}

/** Select elements from a 1D array by indices */
function selectElements(a, indices) {
  const out = new Float64Array(indices.length);
  for (let i = 0; i < indices.length; i++) out[i] = a[indices[i]];
  return out;
}

/** Filter rows of X and y by a boolean mask */
function filterByMask(X, y, mask) {
  const xOut = [], yOut = [];
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) { xOut.push(X[i]); yOut.push(y[i]); }
  }
  return [xOut, Float64Array.from(yOut)];
}

function filterArray(a, mask) {
  const out = [];
  for (let i = 0; i < mask.length; i++) if (mask[i]) out.push(a[i]);
  return Float64Array.from(out);
}

// ---------- Exports ----------

export {
  zeros, zeros2d, ones, full, full2d, eye,
  shape, col,
  add, sub, scale, dot,
  prependOnes, matvec, matTvec,
  sum, mean, variance, max, argmax,
  unique, uniqueFloat, counter, mode,
  randInt, randomChoice, selectRows, selectCols, selectElements,
  filterByMask, filterArray,
};
