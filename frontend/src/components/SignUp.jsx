/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { registerUserApi, checkUserApi } from "../APIrequests/userAPI";

const InputField = ({
  label,
  type,
  name,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
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
    />
    {error && touched && (
      <p className="absolute -top-1 right-1 text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

const SignUp = () => {
  const navigate = useNavigate();

  const registerUserMutation = useMutation({
    mutationKey: ["registerUser"],
    mutationFn: registerUserApi,
  });

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      passmatch: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("First Name is required"),
      lastname: Yup.string().required("Last Name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required")
        .test("email-exists", "Email already exists", async (value) => {
          try {
            const response = await checkUserApi(value);
            if (response?.data?.userExist === false) {
              return true; // Email is valid and not in the database
            } else {
              throw new Yup.ValidationError("Email already in database");
            }
          } catch (error) {
            console.error(error);
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
      try {
        await registerUserMutation.mutateAsync(values);
        navigate("/");
      } catch (error) {
        console.error("Registration failed:", error);
      }
    },
  });

  return (
    <section className="">
      <div className="w-full p-6 space-y-8 sm:p-8  rounded-lg shadow-xl ">
        <h2 className=" text-2xl font-bold text-gray-900">
          Sign up to Maintenance Tracker
        </h2>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              type="text"
              name="firstname"
              id="firstname"
              placeholder="Enter your first name"
              value={formik.values.firstname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.firstname}
              touched={formik.touched.firstname}
              {...formik.getFieldProps("firstname")}
            />
            <InputField
              label="Last Name"
              type="text"
              name="lastname"
              id="lastname"
              placeholder="Enter your last name"
              value={formik.values.lastname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.lastname}
              touched={formik.touched.lastname}
            />
          </div>

          <InputField
            label="Your Email"
            type="email"
            name="email"
            id="email"
            placeholder="name@company.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.email}
            touched={formik.touched.email}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Your Password"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
            />
            <InputField
              label="Confirm Password"
              type="password"
              name="passmatch"
              id="passmatch"
              placeholder="••••••••"
              value={formik.values.passmatch}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.passmatch}
              touched={formik.touched.passmatch}
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg  focus:ring-4 sm:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
          >
            Register
          </button>
          <div className="text-sm font-medium text-gray-900 ">
            Already Registered?{" "}
            <Link to="/signin" className=" hover:underline text-blue-500">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
