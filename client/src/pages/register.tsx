import React from 'react'
import { Form, Formik } from "formik";
import { Box, Button } from '@chakra-ui/core';
import InputField from '../components/InputField';
import { useRouter } from 'next/router';
import { useRegisterMutation } from '../generated/graphql';
import Wrapper from '../components/Wrapper';
import { toErrorMap } from '../utils/setErrors';

interface registerProps {

}



const Register: React.FC<registerProps> = ({ }) => {


  const [, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik initialValues={{ username: '', password: '' }} onSubmit={async (values, { setErrors }) => {
        const response = await register(values);
        if (response.data?.register.errors) {
          setErrors(toErrorMap(response.data.register.errors))
        } else if (response.data?.register.user) {
          router.push('/');
        }

      }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" label="username" placeholder="Username" />
            <Box mt="4">
              <InputField name="password" label="password" placeholder="Password" type="password" />
            </Box>
            <Button mt="2" type="submit" variantColor="blue" isLoading={isSubmitting}>Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;