import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
  user: "postgres",
  host: "localhost",
  database: "railway_system",
  password: "Harshil@123",
  port: 5432,
};

const pool = new Pool(poolConfig);

export default pool;
