import React from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';

const ParallaxSection = ({ backgroundImage, children, height = '100vh', priority = false }: any) => (
     <Box
          sx={{
               position: 'relative',
               height,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               overflow: 'hidden',
          }}
     >
          <Image
               src={backgroundImage}
               alt="Background"
               fill
               priority={priority}
               fetchPriority={priority ? 'high' : 'auto'}
               style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
               }}
               quality={75}
          />
          <Box
               sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
               }}
          >
               {children}
          </Box>
     </Box>
);

export default ParallaxSection;
