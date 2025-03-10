import * as Yup from "yup"

// Validation schema using Yup
export const signInSchema = Yup.object({
     email: Yup.string().email("Enter a valid email").required("Email is required"),
     password: Yup.string().required("Password is required"),
})