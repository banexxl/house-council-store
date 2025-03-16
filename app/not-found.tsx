import type React from "react"
import { Box } from "@mui/material"
import { Header } from "@/components/header"
import { getSessionUser } from "@/lib/get-session"
import { Footer } from "@/components/footer"
import NotFound from "./not-found-content"

export default async function Page() {

     const user = await getSessionUser();

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Header user={user ? user : null} />
               <NotFound />
               <Footer />
          </Box>
     )
}

