# MyGraphQL

MyGraphQL is a MySQL ORM using GraphQL.

It is based on code generation and takes care of everything for you: all you have to do is to define your models in GraphQL

## Quick Start

Init project and follow the prompts:

```bash
npx create @browserql/mygraphql my-project
```

Create your first model in the directory `schema/models`:

```graphql
type Log {
  id: INT!
  message: VARCHAR!
  date: TIMESTAMP! @INDEX
}
```

Generate your code:

```bash
mygraphql gen
```

Write your first queries:

```javascript
import Log from "../__mygraphql/models/Log";

async function insertLog(message, date) {
  return Log.insert({ message, date });
}

async function viewTodaysFirst30Logs() {
  return Log.find(
    (log) => [log.has.date.which.is.today()],
    (query, log) => [query.orderBy(query.desc(log.date)), query.limit(30)]
  );
}
```

That's it!

## Quick examples

Find below some SQL queries translated in models:

```sql
INSERT INTO foo (a, b, c) VALUES (1, 2, 3), (4, 5, 6)
```

```javascript
Foo.insert({ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 });
```

```sql
UPDATE foo
SET a = 1
WHERE a = 0
AND (b < 2 OR C >= 3)
LIMIT 10
```

```javascript
Foo.update(
  { a: 1 },
  (foo) => [
    foo.has.a.which.equals(0),
    [
      [
        foo.has.b.which.is.lesser.than(2),
        foo.has.c.which.is.greater.or.equal.to(3),
      ],
    ],
  ],
  (query) => [query.limit(10)]
);
```

```sql
SELECT cars.brand, wheels.brand
FROM cars
LEFT OUTER JOIN wheels on cars.wheels = wheels.id
WHERE cars.extreme IS NOT NULL
ORDER BY cars.brand ASC, wheels.brand DESC
LIMIT 10
```

```javascript
Car.find(
  (car) => [car.has.extreme.which.is.not(null)],
  (query) => [
    query.left.outer.join(Wheel),
    query.orderBy(query.asc(Car.fields.brand), query.desc(Wheel.fields.brand)),
    query.limit(10)
  ]
);
```
