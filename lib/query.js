"use strict";

var r = require("rethinkdb")

/*
  Sails Query Language:     http://sailsjs.org/documentation/concepts/models-and-orm/query-language
  RethinkDB Query Language: http://rethinkdb.com/api/javascript/
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

  build(query) {
    var q = this.table
    Object.keys(query).forEach(key => {
      var value = query[key]
      switch (key) {
      case "where": q = this.buildWhere(q, value); break
      case "sort": q = this.buildOrder(q, value); break
      case "skip": q = q.skip(value); break
      case "limit": q = q.limit(value); break
      }
    })
    return q
  }

  /*
    where: null

    where: {
      name: 'foo',
      age: {
        '>': 25
      },
      like: {
        name: '%foo%'
      },
      or: [
        { like: { foo: '%foo%' } },
        { like: { bar: '%bar%' } }
      ],
      name: [ 'foo', 'bar;, 'baz' ],
      age: {
        not: 40
      }
    }
   *  [And, Or, Like, Not]

  */
  /**
   * where: {
   *   name: "foo",
   *   age: 3
   * }
   */
  buildWhere(q, segment) {
    if (segment === null) return q
    return q.filter(row => {
      var conditions = Object.keys(segment).map(key => {
        var value = segment[key]
        switch (key) {
        case "or":
          // TODO
          break
        default:
          return this.buildExpression(row, key, value)
        }
      })
      return r.and(...conditions)
    })
  }


  /**
   * Parse Clause
   *
   * <clause> ::= { <clause-pair>, ... }
   *
   * <clause-pair> ::= <field> : <expression>
   *                 | or      : [<clause>, ...]
   */


  /**
   * Parse Expression
   *
   * <expression> ::= { <!|not>: <value> | [<value>, ...] }
   *                | { <modifier>: <value>, ... }
   *                | [<value>, ...]
   *                | <value>
   *
   *  'foo'
   *  {'>': 25}         <, <=, >, >=, !, lessThan, lessThanOrEqual, greaterThan, greaterThanOrEqual, not, like, contains, startsWith, endsWith
   */
  buildExpression(row, field, segment) {
    if (typeof segment === "object") {
      var key = Object.keys(segment)[0]
      var value = segment[key]
      switch (key) {
        case "<": case "lessThan": return row(field).lt(value)
        case "<=": case "lessThanOrEqual": return row(field).le(value)
        case ">": case "greaterThan": return row(field).gt(value)
        case ">=": case "greaterThanOrEqual": return row(field).ge(value)
        case "!": case "not": return row(field).ne(value)
      }
    } else {
      return row(field).eq(segment)
    }
  }

  buildOrder(q, value) {
    // Only support one field {name: 1}, not {name: 1, age: 0}
    var key = Object.keys(value)[0]
    key = value[key] === 1 ? r.asc(key) : r.desc(key)

    return q.orderBy({index: key})
  }
}
