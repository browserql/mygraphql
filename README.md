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
type Log @model {
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

```graphql
type Question @TABLE {
  id: INT! @PRIMARY_KEY @AUTO_INCREMENT
  title: TEXT!
  answer: CHAR!
}

type Option @TABLE {
  id: INT! @PRIMARY_KEY @AUTO_INCREMENT
  title: TEXT!
  letter: CHAR!
  question: INT! @FOREIGN_KEY(REFERENCES: "Question")
}

type Result @TABLE {
  id: INT! @PRIMARY_KEY @AUTO_INCREMENT
  question: INT! @FOREIGN_KEY(REFERENCES: "Question")
  tested: INT! @DEFAULT(INT: 0) @INDEX
  passed: INT! @DEFAULT(INT: 0) @INDEX
}

type Query {
  getRandomQuestion: Question!
  getWorstQuestion: Question!
  getQuestions: [Question!]!
}

type Mutation {
  submitAnswer(question: Question! letter: CHAR!)
}




query {
  SELECT_FROM_Result(
    WHERE: [
      {
        Result_passed: { isLesserThan: { column: Result_tested } } 
      }
    ]
    ORDER_BY: [ { Result_passed: ASC }]
    LIMIT: 1
  ) {

  }

  SELECT_FROM_Patient(
    WHERE: [{ doctor: { equals: $doctorId } }]
    LIMIT: $limit
    OFFSET: $offset
    ORDER_BY: [{ created: ASC }]
  ) {
    ...FullPatientFragment
  }
}

mutation {
  UPDATE_Patient(
    SET: [{ firstName: { to: $firstName } }]
    WHERE: [{ id: { equals: $patientId } }]
  ) {
    ...PatientFragment
  }

  INSERT_INTO_Patient(values: [
    {
      isRegistered: false
      email: "nn@nn.com"
    }
  ]) {
    ... on User {
      ...UserFragment
    }
  }
}
```
