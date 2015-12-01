sails-rethinkdb, a RethinkDB Adapter for Sails.
====================================

**Warnning**: still under early development, not production ready, use at your own risk.

Install
-------

```
$ npm install gutenye/sails-rethinkdb
```

USAGE
-----

```
# edit config/connections.js

  rethinkdb: {
    adapter: 'sails-rethinkdb',
    host: 'localhost',
    db: 'test'
  }

# edit config/models.js

  connection: 'rethinkdb'
```

Roadmap
------

```
Query Syntax        10%
create              YES
update              YES
destroy             YES
count               YES
join                NOT
stream              NOT
```
