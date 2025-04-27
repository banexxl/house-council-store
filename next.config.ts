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

