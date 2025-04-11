import React from 'react';
import { Box } from '@mui/material';

const ParallaxSection = ({ backgroundImage, children, height = '100vh' }: any) => (
     <Box
          sx={{
               backgroundImage: `url(${backgroundImage})`,
               backgroundAttachment: 'fixed',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat',
               backgroundSize: 'cover',
               height,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
          }}
     >
          {children}
     </Box>
);

export default ParallaxSection;
