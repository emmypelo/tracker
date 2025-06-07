/* eslint-disable react/prop-types */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { registerUserApi, checkUserApi } from "../../APIrequests/userAPI";

const InputField = ({
  label,
  type = "text",
  name,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  ...props
}) => (
  <div className="relative">
    <label htmlFor={id} className="form-label">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`form-input p-2.5 ${
        error && touched ? "border-red-500" : "border-gray-300"
      }`}
      required
      {...props}
    />
    {error && touched && (
      <p className="absolute -top-1 right-1 text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

const initialValues = {
  firstname: "",
  lastname: "",
  email: "",
  password: "12345678",
  passmatch: "12345678",
};

const SignUp = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState(null);

  const { mutateAsync: registerUser } = useMutation({
    mutationKey: ["registerUser"],
    mutationFn: registerUserApi,
  });

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      firstname: Yup.string().required("First Name is required"),
      lastname: Yup.string().required("Last Name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required")
        .test("email-exists", "Email already exists", async (value) => {
          if (!value) return true;
          try {
            const response = await checkUserApi(value);
            return !response.userExists;
          } catch (error) {
            return false;
          }
        }),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
      passmatch: Yup.string()
        .required("Password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      setSubmitError(null);
      try {
        await registerUser(values);
        navigate("/signin");
      } catch (error) {
        if (error.response?.data?.message === "User already exists") {
          setSubmitError("This email is already registered");
          formik.setFieldError("email", "Email already exists");
        } else {
          setSubmitError("Registration failed. Please try again.");
        }
      }
    },
  });

  const getFieldProps = (name) => ({
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.errors[name],
    touched: formik.touched[name],
  });

  return (
    <section>
      <div className="w-full p-6 space-y-8 sm:p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900">
          Sign up to Maintenance Tracker
        </h2>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          {submitError && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              name="firstname"
              id="firstname"
              placeholder="Enter your first name"
              {...getFieldProps("firstname")}
            />
            <InputField
              label="Last Name"
              name="lastname"
              id="lastname"
              placeholder="Enter your last name"
              {...getFieldProps("lastname")}
            />
          </div>

          <InputField
            label="Your Email"
            type="email"
            name="email"
            id="email"
            placeholder="name@company.com"
            {...getFieldProps("email")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Your Password"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              {...getFieldProps("password")}
            />
            <InputField
              label="Confirm Password"
              type="password"
              name="passmatch"
              id="passmatch"
              placeholder="••••••••"
              {...getFieldProps("passmatch")}
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg focus:ring-4 sm:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Registering..." : "Register"}
          </button>
          <div className="text-sm font-medium text-gray-900">
            Already Registered?{" "}
            <Link to="/signin" className="hover:underline text-blue-500">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
