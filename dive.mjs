// -*- coding: utf-8, tab-width: 2 -*-

const hasOwn = Object.prototype.hasOwnProperty;

function ensureArray(x) { return Array.isArray(x) ? x : [x]; }
function applyFunc(f, args) { return f(...ensureArray(args)); }
function divePathToString() { return this.join(' › '); }
function diverToString() { return '[GraphDiver @ ' + this.basePath + ']'; }

function makeGraphDiver(root, basePath) {
  const bp = ensureArray(basePath || []);
  function dive(prop, wantType) {
    if (prop === undefined) { return root; }
    if (Array.isArray(prop)) { return prop.reduce(applyFunc, dive); }
    const p = bp.concat(prop);
    p.toString = divePathToString;
    if (!hasOwn.call(root, prop)) {
      const err = new TypeError('Entry does not exist: ' + p);
      err.name = 'SCHEMA_ORG_GRAPH_DIVER_ENTRY_NOT_FOUND';
      err.want = wantType;
      err.path = p;
      throw err;
    }
    const c = root[prop];
    if (wantType !== undefined) {
      const t = (c || false)['@type'];
      if (t !== wantType) {
        const err = new TypeError('Wrong entry @type: Expected ' + wantType
          + ' but got ' + t + ' @ ' + p);
        err.name = 'SCHEMA_ORG_GRAPH_DIVER_WRONG_ENTRY_TYPE';
        err.want = wantType;
        err.found = t;
        err.path = p;
        throw err;
      }
    }
    return makeGraphDiver(c, p);
  }
  bp.toString = divePathToString;
  dive.basePath = bp;
  dive.toString = diverToString;
  return dive;
}

export default makeGraphDiver;
