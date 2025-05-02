module.exports = {
     images: {
          localPatterns: [
               {
                    pathname: '/assets/**',
                    search: '',
               },
               {
                    pathname: '/logo-icons/**',
                    search: '',
               },
               {
                    pathname: '/logos/**',
                    search: '',
               },
               {
                    pathname: '/background-images/**',
                    search: '',
               },
               {
                    pathname: '/images/**',
                    search: '',
               },
               {
                    pathname: '/cards/**',
                    search: '',
               }
          ],
          remotePatterns: [
               {
                    protocol: 'https',
                    hostname: 'images.unsplash.com',
               }
          ]
     },
};

