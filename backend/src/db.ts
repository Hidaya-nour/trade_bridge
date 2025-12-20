// db.ts
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.MYSQL_DB || "tradebridge",
    process.env.MYSQL_USER || "root",
    process.env.MYSQL_PASSWORD || "root",
    {
        host: process.env.MYSQL_HOST || "localhost",
        port: Number(process.env.MYSQL_PORT) || 3308,
        dialect: "mysql",
    }
);

export default sequelize;
