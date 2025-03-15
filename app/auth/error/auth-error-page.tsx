"use client"

import { useEffect, useState } from "react"
import { Box, Container, Typography, Paper, Button, Alert, AlertTitle } from "@mui/material"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function AuthErrorPage() {
     const [isMounted, setIsMounted] = useState(false)
     const searchParams = useSearchParams()
     const [errorMessage, setErrorMessage] = useState<string>("")
     const [errorTitle, setErrorTitle] = useState<string>("Authentication Error")

     useEffect(() => {
          setIsMounted(true)
     }, [])

     useEffect(() => {
          if (isMounted && searchParams) {
               // Get error message from URL query parameters
               const error = searchParams.get("error")
               const errorDescription = searchParams.get("error_description")

               if (error) {
                    setErrorTitle(formatErrorTitle(error))
               }

               if (errorDescription) {
                    setErrorMessage(errorDescription)
               } else if (error) {
                    setErrorMessage(getDefaultErrorMessage(error))
               } else {
                    setErrorMessage("An unknown authentication error occurred.")
               }
          }
     }, [isMounted, searchParams])

     // Format error code to a more readable title
     const formatErrorTitle = (errorCode: string): string => {
          const sentences = errorCode.split("_").join(" ").replace(/([.!?])\s+/g, "$1|").split("|")
          return sentences.map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()).join(" ")
     }

     // Get default error message based on error code
     const getDefaultErrorMessage = (errorCode: string): string => {
          const errorMessages: Record<string, string> = {
               invalid_request: "The request to authenticate was invalid or malformed.",
               access_denied: "The authorization server denied the request.",
               unauthorized_client: "The client is not authorized to request an authorization code.",
               unsupported_response_type:
                    "The authorization server does not support obtaining an authorization code using this method.",
               invalid_scope: "The requested scope is invalid, unknown, or malformed.",
               server_error: "The authorization server encountered an unexpected condition.",
               temporarily_unavailable: "The authorization server is currently unable to handle the request.",
               invalid_client: "Client authentication failed.",
               invalid_grant: "The provided authorization grant or refresh token is invalid, expired, or revoked.",
               unauthorized: "You are not authorized to access this resource.",
               email_not_verified: "Your email address has not been verified.",
               password_reset_required: "You need to reset your password before continuing.",
          }

          return errorMessages[errorCode.toLowerCase()] || "An authentication error occurred."
     }

     return (
          <Container maxWidth="md" sx={{ py: 8 }}>
               <Paper
                    elevation={3}
                    sx={{
                         p: 4,
                         display: "flex",
                         flexDirection: "column",
                         alignItems: "center",
                         borderRadius: 2,
                    }}
               >
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />

                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
                         {errorTitle}
                    </Typography>

                    <Alert
                         severity="error"
                         variant="outlined"
                         sx={{
                              width: "100%",
                              my: 3,
                              "& .MuiAlert-message": {
                                   width: "100%",
                              },
                         }}
                    >
                         <AlertTitle>Error Details</AlertTitle>
                         {errorMessage}
                    </Alert>

                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                         Please try again or contact support if the problem persists.
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                         <Button variant="outlined" component={Link} href="/auth/sign-in">
                              Back to Login
                         </Button>

                         <Button variant="contained" component={Link} href="/auth/register">
                              Sign Up
                         </Button>
                    </Box>
               </Paper>
          </Container>
     )
}

