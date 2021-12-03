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
  date: TIMESTAMP!
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
  return Log.insert({ message, data });
}

async function viewTodaysFirst30Logs() {
  return Log.find(
    (log) => [log.has.date.which.is.today()],
    (query, log) => [query.orderBy(query.desc(log.date)), query.limit(30)]
  );
}
```

That's it!
