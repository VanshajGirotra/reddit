import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql';

import { __IS_PROD__ } from "./config";
import mikroConfig from './mikro-orm.config';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';


const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTTL: true
      }),
      secret: 'keyboard cat', // should be coming from env variable
      resave: false,

      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: __IS_PROD__,
        sameSite: 'lax' // for csrf
      }
    })
  )


  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res })
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started at port 4000");

  });
}

main().catch((e) => {
  console.error(e);
});