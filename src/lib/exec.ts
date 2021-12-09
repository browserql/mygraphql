import { onConnection } from './connect';

export async function exec(
  query: string,
  params?: string[] | Record<string, string>
) {
  return onConnection(async (conn) => {
    console.log(query, params);

    const res = await conn.execute(query, params);

    if (/^SELECT /i.test(query.trim())) {
      return res[0];
    }

    return res;
  });
}
