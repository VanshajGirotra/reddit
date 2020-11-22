import { dedupExchange, fetchExchange } from "urql"
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql"
import { cacheExchange, Cache, QueryInput } from "@urql/exchange-graphcache";

function typedUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any)
}

export const createUrqlClient = ((ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        logout: (_result, _args, cache, _info) => {
          typedUpdateQuery<LogoutMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            () => ({ me: null })
          )
        },
        login: (_result, _args, cache, _info) => {
          typedUpdateQuery<LoginMutation, MeQuery>(cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.login.errors)
                return query
              return {
                me: result.login.user
              }
            })
        },
        register: (_result, _args, cache, _info) => {
          typedUpdateQuery<RegisterMutation, MeQuery>(cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.register.errors)
                return query
              return {
                me: result.register.user
              }
            })
        },
      },
    }
  }), ssrExchange, fetchExchange],
}))