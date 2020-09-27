import React from 'react'
import { Form, Formik } from "formik";
import { Box, Button } from '@chakra-ui/core';
import InputField from '../components/InputField';
import { useRouter } from 'next/router';
import { useLoginMutation } from '../generated/graphql';
import Wrapper from '../components/Wrapper';
import { toErrorMap } from '../utils/setErrors';



const Login: React.FC<{}> = ({ }) => {


  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik initialValues={{ username: '', password: '' }} onSubmit={async (values, { setErrors }) => {
        const response = await login(values);
        if (response.data?.login.errors) {
          setErrors(toErrorMap(response.data.login.errors))
        } else if (response.data?.login.user) {
          router.push('/')
        }

      }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" label="username" placeholder="Username" />
            <Box mt="4">
              <InputField name="password" label="password" placeholder="Password" type="password" />
            </Box>
            <Button mt="2" type="submit" variantColor="blue" isLoading={isSubmitting}>Login</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Login;