import { Box } from '@chakra-ui/core';
import React from 'react'

interface wrapperProps {
  variant?: 'small' | 'regular'
}

const Wrapper: React.FC<wrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box maxW={variant === 'regular' ? '800px' : '400px'} mt="8" mx="auto">
      {children}
    </Box>
  );
}

export default Wrapper;