import React, { useState } from 'react'
import { Form, Formik } from "formik";
import { Box, Button } from '@chakra-ui/core';
import InputField from '../components/InputField';
import { useForgotPasswordMutation } from '../generated/graphql';
import Wrapper from '../components/Wrapper';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlCient';



const ForgotPassword: React.FC<{}> = ({ }) => {

  const [, forgotPassword] = useForgotPasswordMutation()
  const [isForgotPasswordComplete, setForgotPasswordStatus] = useState(false)

  if (isForgotPasswordComplete) {
    return <Box>
      If an account with the provided username / email exists we will send an email.
    </Box>
  }

  return (
    <Wrapper variant="small">
      <Formik initialValues={{ username_email: '' }} onSubmit={async (values,) => {
        const response = await forgotPassword({ username_email: values.username_email })
        if (response.data)
          setForgotPasswordStatus(true)
      }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username_email" label="Username / Email" placeholder="enter username or email" />
            <Button mt="2" type="submit" variantColor="blue" isLoading={isSubmitting}>Submit</Button>
          </Form>
        )}
      </Formik>
    </Wrapper >
  );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);