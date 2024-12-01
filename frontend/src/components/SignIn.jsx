/* eslint-disable react/prop-types */

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUserApi } from "../APIrequests/userAPI";
import { login } from "../redux/slices/authSlices";

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
  <div>
    <label
      htmlFor={id}
      className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
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
      className={`bg-gray-50 border ${
        error && touched ? "border-red-500" : "border-gray-300"
      } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
      required
    />
    {error && touched && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const loginUserMutation = useMutation({
    mutationKey: ["loginUser"],
    mutationFn: loginUserApi,
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const data = await loginUserMutation.mutateAsync(values);
        dispatch(login(data));
        if (location.state?.from) {
          navigate(location.state.from);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Login failed", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="bg-gray-50">
      <div className="w-full p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sign in to Maintenance Tracker
        </h2>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <p className="text-red-500  h-3">
            {loginUserMutation.error?.response?.data?.message ||
              loginUserMutation.error?.message}
          </p>

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
          <div className="flex items-start">
            <Link
              to="/forgot-password"
              className="ms-auto text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Lost Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Logging in..." : "Login to your account"}
          </button>

          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Not registered yet?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline dark:text-blue-500"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;
