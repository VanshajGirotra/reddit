import { Post } from "./entities/Post";
import { DBNAME, USER, __IS_PROD__ } from "./config";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/
  },
  entities: [Post, User],
  dbName: DBNAME,
  user: USER,
  type: 'postgresql',
  debug: !__IS_PROD__
} as Parameters<typeof MikroORM.init>[0];