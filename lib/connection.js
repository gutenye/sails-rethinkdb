"use strict";
var r = require("rethinkdb")
var Table = require("./table")

module.exports = class Connection {
  static connect(options, tables, cb) {
    r.connect(options, (err, conn) => {
      if (err) return cb(err)
      cb(null, new Connection(conn, tables))
    })
  }

  constructor(conn, tables) {
    this.conn = conn
    this.db = r.db(conn.db)
    this._setupTables(tables)
  }

  close(cb) {
    this.conn.close(cb)
  }

  createTable(name, cb) {
    this.db.tableCreate(name).run(this.conn, cb)
  }

  dropTable(name, cb) {
    this.db.tableDrop(name).run(this.conn, cb)
  }

  _setupTables(tables) {
    this.tables = {}
    Object.keys(tables).forEach(tableName => {
      this.db.tableCreate(tableName).run(this.conn, err => {
        if (!err.message.match(/Table `.*` already exists/))
          throw err
      })

      this.tables[tableName] = new Table(this.conn, tableName)
    })
  }
}
