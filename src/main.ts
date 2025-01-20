import { Client } from "@bartlomieju/postgres";

async function main() {
  const url = Deno.env.get("DATABASE_URL");
  const client = new Client(url);
  await client.connect();

  const result = await client.queryObject("SELECT * FROM receipt LIMIT 10;");
  console.log(result);
}

main();
