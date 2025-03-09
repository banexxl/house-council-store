import * as Yup from "yup"

// Validation schema using Yup
export const registrationSchema = Yup.object({
     contact_person: Yup.string().required("Full name is required").min(2, "Name must be at least 2 characters"),
     email: Yup.string().email("Enter a valid email").required("Email is required"),
     confirm_email: Yup.string().oneOf([Yup.ref("email")], "Emails must match"),
     password: Yup.string()
          .min(8, "Password must be at least 8 characters")
          .required("Password is required")
          .matches(
               /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
               "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          ),
     confirm_password: Yup.string()
          .oneOf([Yup.ref("password")], "Passwords must match")
          .required("Confirm password is required"),
     has_accepted_terms_and_conditions: Yup.boolean().oneOf([true], "You must accept the terms and conditions"),
     has_accepted_privacy_policy: Yup.boolean().oneOf([true], "You must accept the privacy policy"),
     has_accepted_marketing: Yup.boolean(),
})