import { Post } from "./entities/post";
import { __IS_PROD__ } from "./config";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/
  },
  entities: [Post],
  dbName: 'reddit',
  user: 'vansh',
  type: 'postgresql',
  debug: __IS_PROD__
} as Parameters<typeof MikroORM.init>[0];