import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import "reflect-metadata";
import { buildSchema } from 'type-graphql';
import { IDENTITY_COOKIE, __IS_PROD__ } from "./config";
import mikroConfig from './mikro-orm.config';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// import { sendEmail } from "./utils/sendEmail";



const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session)
  const redis = new Redis();

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }))

  app.use(
    session({
      name: IDENTITY_COOKIE,
      store: new RedisStore({
        client: redis,
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
    context: ({ req, res }) => ({ em: orm.em, req, res, redis })
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started at port 4000");

  });
}

main().catch((e) => {
  console.error(e);
});