const inherits = require('util').inherits;
const ColumnCompiler_Oracle = require('../../oracle/schema/columncompiler');

const { isObject } = require('lodash');

function ColumnCompiler_Oracledb() {
  ColumnCompiler_Oracle.apply(this, arguments);
}

inherits(ColumnCompiler_Oracledb, ColumnCompiler_Oracle);

Object.assign(ColumnCompiler_Oracledb.prototype, {
  time: 'timestamp with local time zone',

  datetime: function(withoutTz) {
    let useTz;
    if (isObject(withoutTz)) {
      ({ useTz } = withoutTz);
    } else {
      useTz = !withoutTz;
    }
    return useTz ? 'timestamp with local time zone' : 'timestamp';
  },

  timestamp: function(withoutTz) {
    let useTz;
    if (isObject(withoutTz)) {
      ({ useTz } = withoutTz);
    } else {
      useTz = !withoutTz;
    }
    return useTz ? 'timestamp with local time zone' : 'timestamp';
  },
});

module.exports = ColumnCompiler_Oracledb;
