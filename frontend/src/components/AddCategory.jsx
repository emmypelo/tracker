import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addCategoryApi } from "../APIrequests/categoryAPI";

const AddCategory = () => {
  const navigate = useNavigate();
  const categoryMutation = useMutation({
    mutationKey: ["add-category"],
    mutationFn: addCategoryApi,
  });

  const formik = useFormik({
    initialValues: {
      category: "",
      description: "",
    },
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      categoryMutation.mutateAsync(values);
      if (!categoryMutation.isError) {
        navigate("/");
      }
    },
  });

  return (
    <section className="bg-gray-50  flex items-center justify-center w-1/2">
      <div className="w-full max-w-md p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        {categoryMutation.isLoading && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-blue-600">
              Adding Category...
            </h2>
          </div>
        )}
        {categoryMutation.isError && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-red-500">
              {categoryMutation.error?.response?.data?.message ||
                categoryMutation.error?.message}
            </h2>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add  Category
        </h2>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div>
            <label
              htmlFor="category"
              className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Category Name
            </label>
            <input
              type="text"
              name="category"
              id="category"
              {...formik.getFieldProps("category")}
              placeholder="Enter category name"
              className={`bg-gray-50 border ${
                formik.errors.category && formik.touched.category
                  ? "border-red-500"
                  : "border-gray-300"
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
            />
            {formik.errors.category && formik.touched.category && (
              <p className="mt-1 text-sm text-red-500">
                {formik.errors.category}
              </p>
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
            {formik.isSubmitting ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddCategory;
