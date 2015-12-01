sails-rethinkdb, a RethinkDB Adapter for Sails.
====================================

**Warnning**: still under early development, not production ready, use at your own risk.

Contributions are welcome, the code is well structure and easy to understand.

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

[Connections Options Reference](http://rethinkdb.com/api/javascript/connect)

native() method

```
User.native((err, table) => {
  table.filter({id: 1}).count().run(table.conn, (err, result) => {
    ..
  })
})
```

Roadmap
------

```
Query Syntax        20%
create              YES
update              YES
destroy             YES
count               YES
native              YES
join                NOT
stream              NOT
```
