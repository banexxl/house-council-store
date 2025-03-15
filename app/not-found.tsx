import type React from "react"
import { Box } from "@mui/material"
import Header from "@/components/header"
import { getSession } from "@/lib/get-session"
import Footer from "@/components/footer"
import NotFound from "./not-found-content"

export default async function Page() {

     const session = await getSession();

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Header user={session ? session.user : null} />
               <NotFound />
               <Footer />
          </Box>
     )
}

