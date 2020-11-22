import React from 'react'
import { Form, Formik } from "formik";
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import InputField from '../components/InputField';
import { useRouter } from 'next/router';
import { useLoginMutation } from '../generated/graphql';
import Wrapper from '../components/Wrapper';
import { toErrorMap } from '../utils/setErrors';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlCient';
import NextLink from 'next/link'


const Login: React.FC<{}> = ({ }) => {

  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik initialValues={{ username_email: '', password: '' }} onSubmit={async (values, { setErrors }) => {
        const response = await login(values);
        if (response.data?.login.errors) {
          setErrors(toErrorMap(response.data.login.errors))
        } else if (response.data?.login.user) {
          router.push('/')
        }

      }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username_email" label="Username / Email" placeholder="enter username or email" />
            <Box mt="4">
              <InputField name="password" label="password" placeholder="Password" type="password" />
            </Box>
            <Flex alignItems="center" justifyContent="space-between">
              <NextLink href="/forgot-password"><Link>Forgot password ? </Link></NextLink>
              <Button mt="2" type="submit" variantColor="blue" isLoading={isSubmitting}>Login</Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper >
  );
}

export default withUrqlClient(createUrqlClient)(Login);