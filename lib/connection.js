const r = require("rethinkdb")
const Table = require("./table")
const utils = require("./utils")

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
    sails.r = this.db
    sails.conn = conn
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
    utils.forOwn(tables, (v, name) => {
      this.db.tableCreate(name).run(this.conn, err => {
        if (err && !err.message.match(/Table `.*` already exists/))
          throw err
      })

      this.tables[name] = new Table(this.conn, name)
    })
  }
}
