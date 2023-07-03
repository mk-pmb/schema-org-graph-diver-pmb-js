// -*- coding: utf-8, tab-width: 2 -*-

const hasOwn = Object.prototype.hasOwnProperty;

function orf(x) { return (x || false); }
function ensureArray(x) { return Array.isArray(x) ? x : [x]; }
function applyFunc(f, args) { return f(...ensureArray(args)); }
function divePathToString() { return this.join(' › '); }
function diverToString() { return '[GraphDiver @ ' + this.basePath + ']'; }

const EX = function makeGraphDiver(root, basePath) {
  const bp = ensureArray(basePath || []);
  bp.toString = divePathToString;

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
      const t = orf(c)['@type'];
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
    return EX(c, p);
  }

  Object.assign(dive, { basePath: bp }, EX.diverApi);
  return dive;
};


EX.diverApi = {

  toString: diverToString,

  allWithType(wantType) {
    const dive = this;
    const root = dive();
    const found = Object.values(root)
      .filter(rec => ensureArray(orf(rec)['@type']).includes(wantType))
      .map(rec => EX(rec));
    return found;
  },


};



export default EX;
