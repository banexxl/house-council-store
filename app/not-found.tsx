import type React from "react"
import { Box } from "@mui/material"
import { Footer } from "@/app/components/footer"
import NotFound from "./not-found-content"

export default async function Page() {
     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <NotFound />
               <Footer />
          </Box>
     )
}

