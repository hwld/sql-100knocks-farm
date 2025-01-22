import { Client } from "@bartlomieju/postgres";

const url = Deno.env.get("DATABASE_URL");
export const db = new Client(url);
