import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql';

import { __IS_PROD__ } from "./config";
import mikroConfig from './mikro-orm.config';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";


const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em })
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started at port 4000");

  });
}

main().catch((e) => {
  console.error(e);
});