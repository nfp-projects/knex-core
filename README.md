# [knex-core](http://knexjs.org)

A much lighter dependancy and size version of original [knex](https://github.com/knex/knex) without the bulky cli functionality and no browser support. Now only retains the core functionality.

[![npm version](http://img.shields.io/npm/v/knex-core.svg)](https://npmjs.org/package/knex-core)
[![npm downloads](https://img.shields.io/npm/dm/knex-core.svg)](https://npmjs.org/package/knex-core)
[![Build Status](https://travis-ci.org/nfp-projects/knex-core.svg?branch=master)](https://travis-ci.org/nfp-projects/knex-core)
[![Gitter chat](https://badges.gitter.im/tgriesser/knex.svg)](https://gitter.im/tgriesser/knex)

> **A SQL query builder that is _flexible_, _portable_, and _fun_ to use!**

A batteries-included, multi-dialect (MSSQL, MySQL, PostgreSQL, SQLite3, Oracle (including Oracle Wallet Authentication)) query builder for
Node.js, featuring:

- [transactions](http://knexjs.org/#Transactions)
- [connection pooling](http://knexjs.org/#Installation-pooling)
- [streaming queries](http://knexjs.org/#Interfaces-Streams)
- both a [promise](http://knexjs.org/#Interfaces-Promises) and [callback](http://knexjs.org/#Interfaces-Callbacks) API
- a [thorough test suite](https://travis-ci.org/tgriesser/knex)
- the ability to [run in the Browser](http://knexjs.org/#Installation-browser)

Node.js versions 8+ are supported.

[Read the full documentation to get started!](http://knexjs.org)  
[Or check out our Recipes wiki to search for solutions to some specific problems](https://github.com/tgriesser/knex/wiki/Recipes)  
If upgrading from older version, see [Upgrading instructions](https://github.com/tgriesser/knex/blob/master/UPGRADING.md)

For support and questions, join the `#bookshelf` channel on freenode IRC

For an Object Relational Mapper, see:

- http://bookshelfjs.org
- https://github.com/Vincit/objection.js

To see the SQL that Knex will generate for a given query, see: [Knex Query Lab](http://michaelavila.com/knex-querylab/)

## Examples

We have several examples [on the website](http://knexjs.org). Here is the first one to get you started:

```js
const knex = require('knex')({
  dialect: 'sqlite3',
  connection: {
    filename: './data.db',
  },
});

// Create a table
knex.schema
  .createTable('users', function(table) {
    table.increments('id');
    table.string('user_name');
  })

  // ...and another
  .createTable('accounts', function(table) {
    table.increments('id');
    table.string('account_name');
    table
      .integer('user_id')
      .unsigned()
      .references('users.id');
  })

  // Then query the table...
  .then(function() {
    return knex('users').insert({ user_name: 'Tim' });
  })

  // ...and using the insert id, insert into the other table.
  .then(function(rows) {
    return knex('accounts').insert({ account_name: 'knex', user_id: rows[0] });
  })

  // Query both of the rows.
  .then(function() {
    return knex('users')
      .join('accounts', 'users.id', 'accounts.user_id')
      .select('users.user_name as user', 'accounts.account_name as account');
  })

  // .map over the results
  .map(function(row) {
    console.log(row);
  })

  // Finally, add a .catch handler for the promise chain
  .catch(function(e) {
    console.error(e);
  });
```
