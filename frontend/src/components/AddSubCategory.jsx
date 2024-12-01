import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addSubCategoryApi } from "../APIrequests/subCategoryAPI";

const AddSubCategory = () => {
  const navigate = useNavigate();
  const subCategoryMutation = useMutation({
    mutationKey: ["add-subcategory"],
    mutationFn: addSubCategoryApi,
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      subCategoryMutation.mutateAsync(values);
      if (!subCategoryMutation.isError) {
        navigate("/");
      }
    },
  });

  return (
    <section className="bg-gray-50 flex items-center justify-center w-1/2">
      <div className="w-full max-w-md p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        {subCategoryMutation.isLoading && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-blue-600">
              Adding subcategory...
            </h2>
          </div>
        )}
        {subCategoryMutation.isError && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-red-500">
              {subCategoryMutation.error?.response?.data?.message ||
                subCategoryMutation.error?.message}
            </h2>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add subcategory
        </h2>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div>
            <label
              htmlFor="title"
              className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Subcategory Name
            </label>
            <input
              type="text"
              name="title"
              id="title"
              {...formik.getFieldProps("title")}
              placeholder="Enter category name"
              className={`bg-gray-50 border ${
                formik.errors.category && formik.touched.category
                  ? "border-red-500"
                  : "border-gray-300"
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
            />
            {formik.errors.title && formik.touched.title && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Description
            </label>
            <input
              type="text"
              name="description"
              id="description"
              {...formik.getFieldProps("description")}
              placeholder="Enter category description"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add subcategory"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddSubCategory;
