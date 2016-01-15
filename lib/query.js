"use strict";

var r = require("rethinkdb")
var utils = require("./utils")

/*
  Sails Query Language:     http://sailsjs.org/documentation/concepts/models-and-orm/query-language
  RethinkDB Query Language: http://rethinkdb.com/api/javascript
*/
module.exports = class Query {

  /* Build a RethinkDB query
   *
   * return a query like r.db("test").table("users").filter(v => v("name").eq("hello"))
   */
  static build(table, query) {
    return new Query(table).build(query)
  }

  constructor(table) {
    this.table = table
  }

  /**
   * Build
   *
   *  {
   *    where: x,
   *    limit: x,
   *    skip: x,
   *    sort: x
   *  }
   */
  build(query) {
    var t = this.table
    utils.forOwn(query, (value, key) => {
      switch (key) {
      case "where": t = this.buildWhere(t, value); break
      case "sort": t = this.buildSort(t, value); break
      case "skip": t = t.skip(value); break
      case "limit": t = t.limit(value); break
      }
    })
    return t
  }

  /**
   * Build Where
   *
   * null
   * {id: 1}
   */
  buildWhere(t, segment) {
    if (segment === null)
      return t
    return t.filter(row => this.buildClause(row, segment))
  }

  /**
   * Build Clause
   *
   * <clause> ::= { <clause-pair>, ... }
   *
   * <clause-pair> ::= <field> : <expression>
   *                 | or|$or: [<clause>, ...]
   *                 | $and  : [<clause>, ...]
   *                 | $nor  : [<clause>, ...]
   *                 | like  : { <field>: <expression>, ... }
   *
   * {
   *   id : 1,
   *   or : [{id: "or"}, ...]
   * }
   */
  buildClause(row, segment) {
    var conditions = []
    utils.forOwn(segment, (value, key) => {
      switch (key) {
        case "or": conditions.push(this.buildOr(row, value)); break
        default: conditions.push(this.buildExpression(row, key, value))
        // TODO: and nor like
      }
    })
    return r.and(...conditions)
  }

  /**
   * Build or
   *
   * [{id: "or"}, ...]
   */
  buildOr(row, segment) {
    var conditions = segment.map(v => this.buildClause(row, v))
    return r.or(...conditions)
  }

  /**
   * Build Expression
   *
   * <expression> ::= { <modifier>: <value>, ... }
   *                | [<value>, ...] | {"!": [<value>, ...]}
   *                | <value>
   *
   *  "foo"
   *  {">": 25}         <, <=, >, >=, !, lessThan, lessThanOrEqual, greaterThan, greaterThanOrEqual, not, like, contains, startsWith, endsWith
   *  ["a", "b"]
   */
  buildExpression(row, field, segment) {
    if (utils.isPlainObject(segment)) {
      var key = Object.keys(segment)[0]
      var value = segment[key]
      switch (key) {
        case "<": case "lessThan": return row(field).lt(value)
        case "<=": case "lessThanOrEqual": return row(field).le(value)
        case ">": case "greaterThan": return row(field).gt(value)
        case ">=": case "greaterThanOrEqual": return row(field).ge(value)
        case "!": case "not": return row(field).ne(value)
        // TODO: like, contains, startsWith, endsWidth
      }

    } else if (utils.isArray(segment)) {
      // TODO: in operator

    } else {
      return row(field).eq(segment)
    }
  }


  /**
   * Build Sort
   *
   * "age" "age DESC" ASC {name: 1, age: 0}
   */
  buildSort(t, value) {
    var orders = []
    if (utils.isString(value)) {
      value = value.trim()
      var parts = value.split(/ +/)
      orders.push(parts[1] === "DESC" ? r.desc(parts[0]) : r.asc(parts[0]))
    } else {
      utils.forOwn(value, (v, k) => {
        orders.push(v === 0 ? r.desc(k) : r.asc(k))
      })
    }
    console.log(1, orders)
    return t.orderBy(...orders)
  }
}
