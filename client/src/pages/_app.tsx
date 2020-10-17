import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import theme from '../theme'

function typedUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any)
}

function MyApp({ Component, pageProps }: any) {
  const client = createClient({
    url: 'http://localhost:4000/graphql',
    fetchOptions: { credentials: "include" },
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
    }), fetchExchange],
  });
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider>
          <CSSReset />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default MyApp
