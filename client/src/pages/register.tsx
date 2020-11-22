import React from 'react'
import { Form, Formik } from "formik";
import { Box, Button } from '@chakra-ui/core';
import InputField from '../components/InputField';
import { useRouter } from 'next/router';
import { useRegisterMutation } from '../generated/graphql';
import Wrapper from '../components/Wrapper';
import { toErrorMap } from '../utils/setErrors';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlCient';

interface registerProps {

}



const Register: React.FC<registerProps> = ({ }) => {


  const [, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik initialValues={{ email: '', username: '', password: '' }} onSubmit={async (values, { setErrors }) => {
        const response = await register({ options: values });
        if (response.data?.register.errors) {
          setErrors(toErrorMap(response.data.register.errors))
        } else if (response.data?.register.user) {
          router.push('/');
        }

      }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" label="Username" placeholder="Enter Username" />
            <Box mt="4">
              <InputField name="email" label="Email" placeholder="imjeff@jeffworks" type="email" />
            </Box>
            <Box mt="4">
              <InputField name="password" label="Password" placeholder="Password" type="password" />
            </Box>
            <Button mt="2" type="submit" variantColor="blue" isLoading={isSubmitting}>Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Register);