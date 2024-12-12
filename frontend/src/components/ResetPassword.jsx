/* eslint-disable react/prop-types */

import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { resetPasswordApi } from "../APIrequests/userAPI";

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
      className={` ${
        error && touched ? "border-red-500" : "border-gray-300"
      } form-input p-2.5`}
      required
    />
    {error && touched && (
      <p className="absolute -top-1 right-0 mt-1 text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
);

const ResetPassword = () => {
  //get the token from the url
  const { verifyToken } = useParams();
  //navigate
  const navigate = useNavigate();
  // user mutation
  const resetPasswordMutation = useMutation({
    mutationKey: ["reset-password"],
    mutationFn: resetPasswordApi,
  });

  const formik = useFormik({
    initialValues: {
      password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const data = {
        password: values.password,
        verifyToken,
      };
      try {
        const res = await resetPasswordMutation.mutateAsync(data).then(() => {
          // redirect
          navigate("/signin");
        });
        console.log(res);
      } catch (error) {
        console.error("Request failed", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="">
      <div className="w-full p-6 space-y-8 sm:p-8 rounded-lg shadow-xl ">
        <h2 className="text-2xl font-bold text-slate-900 ">Reset Password</h2>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <p className="text-red-500  h-3">
            {resetPasswordMutation.error?.response?.data?.message ||
              resetPasswordMutation.error?.message}
          </p>

          <InputField
            label="New Password"
            type="password"
            name="password"
            id="password"
            placeholder="Enter new password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.email}
            touched={formik.touched.email}
          />

          <div className="flex items-start">
            <Link
              to="/forgot-password"
              className="ms-auto text-sm font-medium text-blue-600 hover:underline "
            >
              Back to login page?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white  rounded-lg focus:ring-4 sm:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Loading in..." : "Reset password"}
          </button>

          <div className="text-sm font-medium text-gray-900 ">
            Not registered yet?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline ">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
