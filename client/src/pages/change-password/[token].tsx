import { Box, Button, Link } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlCient";
import { toErrorMap } from "../../utils/setErrors";
import NextLink from 'next/link';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('')
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik initialValues={{ new_password: '' }} onSubmit={async (values, { setErrors }) => {
        const response = await changePassword({ token, new_password: values.new_password })
        if (response.data?.changePassword.errors) {
          const errorMap = toErrorMap(response.data.changePassword.errors);
          setErrors(errorMap)
          if (errorMap.token)
            setTokenError(errorMap.token)
        } else {
          router.push('/');
        }
      }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="new_password" label="New Password" type="password" placeholder="enter new password" />
            {tokenError ? <Box>Your token has expired. Click <NextLink href="/forgot-password"><Link>here</Link></NextLink> to generate a new one</Box> : null}
            <Button mt="2" type="submit" variantColor="blue" isLoading={isSubmitting}>Change Password</Button>

          </Form>
        )}
      </Formik>
    </Wrapper >
  )
}

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword)