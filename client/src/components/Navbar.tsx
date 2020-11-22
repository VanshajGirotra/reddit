import { Flex, Link, Box, Button } from '@chakra-ui/core'
import React from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'

interface NavbarProps {

}

const Navbar: React.FC<NavbarProps> = ({ }) => {
  const [{ fetching, data }] = useMeQuery({ pause: isServer() })
  const [{ fetching: logoutFetching }, onLogout] = useLogoutMutation()

  let body = null
  if (fetching) {
    body = null
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr="2">Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Box>
        {data.me.username} <Button variant="link" isLoading={logoutFetching} onClick={() => { onLogout() }} ml="2">Logout</Button>
      </Box>
    )
  }


  return (
    <div>
      <Flex bg="tan" p={4} >
        <Box ml="auto">
          {body}
        </Box>
      </Flex>
    </div>
  );
}

export default Navbar