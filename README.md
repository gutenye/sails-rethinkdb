sails-rethinkdb, a RethinkDB Adapter for Sails.
====================================

a

[Homepage](https://github.com/gutenye/sails-rethinkdb) |
[Documentation](https://github.com/gutenye/sails-rethinkdb/wiki) |
[Issue Tracker](https://github.com/gutenye/sails-rethinkdb/issues) |
[MIT License](http://choosealicense.com/licenses/mit) |
[by Guten](http://guten.me) |
[Gratipay](https://gratipay.com/gutenye) |
[Bountysource](https://www.bountysource.com/teams/gutenye)

Contributions are welcome, the code is well structured and easy to understand.

Install
-------

```
$ npm install gutenye/sails-rethinkdb#master
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
  var {conn, r} = table
  table.filter({id: 1}).count().run(conn, (err, result) => {
    ..
  })
})
```

Relationships

one-to-many: `r.table("posts").indexCreate("user")`
many-to-many: `r.table("tags_users__users_tags").indexCreate("users_tags")` `r.table("tags_users__users_tags").indexCreate("tags_users")`

Assess rethinkdb

```
sails.r
sails.conn

# Some times you need create index manulaly

const {r, conn} = sails
r.table("tags_users__users_tags").indexCreate("users_tags").run(conn, (err, result) => {})
```

Roadmap
------

|                     |                     |
|---------------------|---------------------|
|Sails Query Language | [80%](https://github.com/gutenye/sails-rethinkdb/blob/master/lib/query.js)
| create              | COMPLETED
| update              | COMPLETED
| destroy             | COMPLETED
| count               | COMPLETED
| native              | COMPLETED
| join                | COMPLETED
| stream              | NOT

Query Language Different from Official

- contains is for array

```
{tags: {"contains": [1, 2]}} means tags.includes(1) and tags.includes(2)
```

- limit, skip support string, and limit support -1

```
{limit: 30}
{limit: "30"}
{limit: -1}     -1 means all records
```

Development
===========

Contributing
-------------

* Submit any bugs/features/ideas to github issue tracker.

Thanks to [all contributors](https://github.com/gutenye/sails-rethinkdb/contributors).

Copyright
---------

The MIT License (MIT)

Copyright (c) 2015-2016 Guten Ye

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
