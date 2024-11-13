import { parse } from "path";
import { cons } from "../../../common/utils/functional/functional";

interface Expression {
    op: string;
    operand?: Expression;
    expression?: Expression;
    name?: string;
    value?: any;
    type?: string;
    setType?: string;
    elements?: any[];
    attributes?: any[];
    data?: any[];
    direction?: string;
    dataName?: string;
  }
  
  export function translateExpressionToBigQuery(expr: Expression): string {
    if (!expr || !expr.op) {
      throw new Error("Invalid expression");
    }
  
    const fragments = {
      select: [] as string[],
      from: "`your_table_name`", // Replace with actual table name
      where: [] as string[],
      groupBy: [] as string[],
      orderBy: [] as string[],
      limit: ""
    };
  
    (function parseExpression(e: Expression) {
      switch (e.op) {
        case "apply":
          parseExpression(e.expression!);
          break;
        case "filter":
          fragments.where.push(handleFilter(e));
          break;
        case "overlap":
          fragments.where.push(handleOverlap(e));
          break;
        case "literal":
          fragments.select.push(handleLiteral(e));
          break;
        case "ref":
          fragments.select.push(`${handleRef(e)}`);
          if (e.name) fragments.groupBy.push(e.name);
          break;
        case "count":
          fragments.select.push(`COUNT(${handleRef(e.operand!)}) AS ${e.name || 'count'}`);
          break;
        case "sort":
          parseExpression(e.operand!);
          fragments.orderBy.push(`${handleRef(e.expression!)} ${(e.direction || "").toUpperCase()}`);
          break;
        case "limit":
          fragments.limit = `LIMIT ${e.value}`;
          break;
        case "split":
          fragments.select.push(`${handleRef(e.expression!)} AS ${e.name}`);
          fragments.groupBy.push(e.name || "");
          parseExpression(e.operand!); // in case there are nested operations
          break;
        default:
          throw new Error(`Unsupported operation: ${e.op}`);
      }
  
      if (e.operand) parseExpression(e.operand);
      if (e.expression) parseExpression(e.expression);
    })(expr);
  
    const query = [
      "SELECT",
      fragments.select.join(", "),
      `FROM ${fragments.from}`,
      fragments.where.length ? `WHERE ${fragments.where.join(" AND ")}` : "",
      fragments.groupBy.length ? `GROUP BY ${fragments.groupBy.join(", ")}` : "",
      fragments.orderBy.length ? `ORDER BY ${fragments.orderBy.join(", ")}` : "",
      fragments.limit
    ].filter(Boolean).join(" ");
  
    return query;
  }
  
  function handleLiteral(expr: Expression): string {
    if (expr.type === "SET" && expr.setType === "TIME_RANGE") {
      const [timeRange] = expr.value.elements;
      return `TIMESTAMP('${timeRange.start}') AND TIMESTAMP('${timeRange.end}')`;
    } else {
      return expr.value.toString();
    }
  }
  
  function handleRef(expr: Expression): string {
    return `\`${expr.name}\``;
  }
  
  function handleFilter(expr: Expression): string {
    const condition = translateExpressionToBigQuery(expr.expression!);
    return condition;
  }
  
  function handleOverlap(expr: Expression): string {
    const operand = handleRef(expr.operand!);
    const overlapExpression = handleLiteral(expr.expression!);
    return `${operand} BETWEEN ${overlapExpression}`;
  }
  
  // Example usage with the provided JSON structure
  const expression: Expression = {
    "op": "apply",
    "operand": {
      "op": "apply",
      "operand": {
        "op": "apply",
        "operand": {
          "op": "apply",
          "operand": {
            "op": "literal",
            "value": {
              "attributes": [],
              "data": [
                {}
              ]
            },
            "type": "DATASET"
          },
          "expression": {
            "op": "filter",
            "operand": {
              "op": "ref",
              "name": "main"
            },
            "expression": {
              "op": "overlap",
              "operand": {
                "op": "ref",
                "name": "__time"
              },
              "expression": {
                "op": "literal",
                "value": {
                  "setType": "TIME_RANGE",
                  "elements": [
                    {
                      "start": "2015-12-01T00:01:00.000Z",
                      "end": "2016-01-01T00:01:00.000Z"
                    }
                  ]
                },
                "type": "SET"
              }
            }
          },
          "name": "main"
        },
        "expression": {
          "op": "literal",
          "value": 2592000000
        },
        "name": "MillisecondsInInterval"
      },
      "expression": {
        "op": "count",
        "operand": {
          "op": "ref",
          "name": "main"
        }
      },
      "name": "count"
    },
    "expression": {
      "op": "limit",
      "operand": {
        "op": "sort",
        "operand": {
          "op": "apply",
          "operand": {
            "op": "split",
            "operand": {
              "op": "ref",
              "name": "main"
            },
            "name": "sex",
            "expression": {
              "op": "ref",
              "name": "sex"
            },
            "dataName": "main"
          },
          "expression": {
            "op": "count",
            "operand": {
              "op": "ref",
              "name": "main"
            }
          },
          "name": "count"
        },
        "expression": {
          "op": "ref",
          "name": "count"
        },
        "direction": "descending"
      },
      "value": 100
    },
    "name": "SPLIT"
  };

  let n = 0;
  let limit = -1;
  let start;
  let end;
  let timeBucketSize = 0;
  let groupBys: string[] = [];
  const parseExpression = (exp: Expression) => {
    if (!exp) {
        return
    }
    n++;

    parseExpression(exp.operand)
    parseExpression(exp.expression)

      switch (exp.op) {
          case "apply":
              switch (exp.name) {
                  case "MillisecondsInInterval":
                      timeBucketSize = exp.expression.value
                      break;
                  default:
                    break
                    //   throw new Error(`Unsupported operation: ${exp.name}`);
              }
              break;
          case "filter":
            // TODO
              break;
          case "overlap":
              switch (exp.expression.value.setType) {
                  case "TIME_RANGE":
                      start = exp.expression.value.elements[0].start
                      end = exp.expression.value.elements[0].end
                      break;
                  default:
                      throw new Error(`Unsupported operation: ${exp.expression.value.setType}`);
                      break;
              }
              // console.log(JSON.stringify(exp))
              break;
          case "literal":
              break;
          case "ref":
              break;
          case "split":
              // console.log(exp)
              groupBys.push(exp.name)
              break;
          case "count":
              break;
          case "sort":
              break;
          case "limit":
              // console.log(exp)
              limit = exp.value
              break;
          default:
              throw new Error(`Unsupported operation: ${exp.op}`);
      }
  }
  
//   parseExpression(expression)
//   console.log(`groupBys: ${groupBys}`)
//   console.log(`timeBucketSize: ${timeBucketSize}`)
//   console.log(`start: ${start}`)
//   console.log(`end: ${end}`)
//   console.log(`limit: ${limit}`)

//   console.log(`select ${groupBys.map(g => `count(${g})`).join(', ')} from TABLE_NAME group by ${groupBys.join(', ')} order by ${groupBys.join(', ')} desc limit ${limit}`)

//   console.log(n)
//   const sqlQuery = translateExpressionToBigQuery(expression);
//   console.log(sqlQuery);