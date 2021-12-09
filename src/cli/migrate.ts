import { EFAULT } from 'constants';
import { readFile } from 'fs/promises';
import {
  ConstArgumentNode,
  ConstDirectiveNode,
  ConstValueNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  parse,
  TypeNode,
} from 'graphql';
import snakeCase from 'lodash.snakecase';
import pluralize from 'pluralize';
import { exec } from '../lib/exec';

async function tableExists(name: string) {
  const res = await exec(
    `SELECT COUNT(table_name) AS table_exists FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [name]
  );
  return Boolean(res[0].table_exists);
}

async function fieldExists(table: string, field: string) {
  const res = await exec(
    `SELECT COUNT(table_name) AS field_exists FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, field]
  );
  return Boolean(res[0].field_exists);
}

async function getFieldInfo(table: string, field: string) {
  const res = await exec(
    `SELECT * FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, field]
  );
  return res[0];
}

function getFinalType(type: TypeNode): string {
  if (type.kind === 'NonNullType') {
    return getFinalType(type.type);
  }
  if (type.kind === 'ListType') {
    return getFinalType(type.type);
  }
  return type.name.value;
}

function printType(field: FieldDefinitionNode) {
  const resolved = getFinalType(field.type);
  const { directives = [] } = field;

  if (resolved === 'INT') {
    return 'INT';
  }

  if (resolved === 'TEXT') {
    return 'TEXT';
  }

  if (resolved === 'CHAR') {
    return 'CHAR';
  }

  if (resolved === 'CHAR') {
    return 'CHAR';
  }

  if (resolved === 'BOOLEAN') {
    return 'BOOLEAN';
  }

  if (resolved === 'VARCHAR') {
    const MAX = directives.find((directive) => directive.name.value === 'MAX');

    let maxLength = 255;

    if (MAX) {
      const { arguments: args = [] } = MAX;

      const LENGTH = args.find((arg) => arg.name.value === 'LENGTH');

      if (LENGTH) {
        // @ts-ignore
        maxLength = LENGTH.value.value;
      }
    }

    return `VARCHAR(${maxLength})`;
  }
}

function printDefault(df: ConstDirectiveNode) {
  const { arguments: args = [] } = df;
  const [arg] = args;
  console.log({ default: arg });

  if (arg.value.kind === 'IntValue') {
    return `DEFAULT ${arg.value.value}`;
  }

  if (arg.value.kind === 'StringValue') {
    return `DEFAULT "${arg.value.value}"`;
  }

  return ``;
}

function printField(field: FieldDefinitionNode) {
  const fieldName = field.name.value;
  const { directives = [] } = field;

  const AUTO_INCREMENT = directives.find(
    (directive) => directive.name.value === 'AUTO_INCREMENT'
  );

  const DEFAULT = directives.find(
    (directive) => directive.name.value === 'DEFAULT'
  );

  return `\`${fieldName}\` ${printType(field)} ${
    field.type.kind === 'NonNullType' ? 'NOT NULL' : 'NULL'
  } ${AUTO_INCREMENT ? 'AUTO_INCREMENT' : ''} ${
    DEFAULT ? printDefault(DEFAULT) : ''
  }`.trim();
}

async function createTable(table: ObjectTypeDefinitionNode) {
  const tableName = getTableName(table);

  const table_exists = await tableExists(tableName);

  if (!table_exists) {
    console.log('Creating table', tableName);
    const { fields = [] } = table;

    const primaryKey = fields.find((field) => {
      const { directives = [] } = field;
      return directives.find(
        (directive) => directive.name.value === 'PRIMARY_KEY'
      );
    });

    const list: string[] = [...fields.map((field) => printField(field))];

    if (primaryKey) {
      list.push(`PRIMARY KEY (\`${primaryKey.name.value}\`)`);
    }

    const q = `
CREATE TABLE \`${process.env.MYSQL_DB_NAME}\`.\`${tableName}\`(
  ${list.join(',\n  ')}
)
`;

    await exec(q);
  } else {
    console.log('Table exists', tableName);
  }
}

export async function createTableFields(table: ObjectTypeDefinitionNode) {
  const tableName = getTableName(table);
  const { fields = [] } = table;

  await Promise.all(
    fields.map(async (field) => {
      const fieldName = field.name.value;
      const field_exists = await fieldExists(tableName, fieldName);

      if (!field_exists) {
        const q = `ALTER TABLE \`${
          process.env.MYSQL_DB_NAME
        }\`.\`${tableName}\` ADD COLUMN ${printField(field)}`;

        await exec(q);
      } else {
        // console.log(await getFieldInfo(tableName, fieldName));
        const {
          DATA_TYPE: existingType,
          IS_NULLABLE,
          COLUMN_DEFAULT,
        } = await getFieldInfo(tableName, fieldName);
      }
    })
  );
}

function getTableName(table: ObjectTypeDefinitionNode) {
  const NAME = table.name.value;
  const { directives = [] } = table;
  const TABLE = directives.find(
    (directive) => directive.name.value === 'TABLE'
  ) as ConstDirectiveNode;
  const { arguments: args = [] } = TABLE;

  const TABLENAME = args.find(
    (arg) => arg.name.value === 'NAME'
  ) as ConstArgumentNode;

  return TABLENAME
    ? // @ts-ignore
      (TABLENAME.value as ConstValueNode).value
    : pluralize(snakeCase(NAME)).toLowerCase();
}

export async function migrate(grapqhlFile: string) {
  const contents = await readFile(grapqhlFile);
  const source = contents.toString();
  const schema = parse(source);
  const types = schema.definitions.filter(
    (def) => def.kind === 'ObjectTypeDefinition'
  ) as ObjectTypeDefinitionNode[];
  const tables = types.filter((type) => {
    const { directives = [] } = type;
    return directives.find((directive) => directive.name.value === 'TABLE');
  });
  await Promise.all(tables.map(createTable));
  await Promise.all(tables.map(createTableFields));
}

const [, , grapqhlFile] = process.argv;

migrate(grapqhlFile);
