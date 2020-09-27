import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import { createClient, Provider } from 'urql'

import theme from '../theme'

function MyApp({ Component, pageProps }: any) {
  const client = createClient({ url: 'http://localhost:4000/graphql', fetchOptions: { credentials: "include" } });
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
