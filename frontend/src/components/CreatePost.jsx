import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../APIrequests/subCategoryAPI";
import { createTaskApi } from "../APIrequests/taskAPI";

const CreatePost = () => {
  const postMutation = useMutation({
    mutationKey: ["createTask"],
    mutationFn: createTaskApi,
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      vendor: "",
      amount: "",
      approver: "",
      category: "",
      subCategory: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      vendor: Yup.string().required("Vendor is required"),
      amount: Yup.number().required("Amount is required"),
      approver: Yup.string().required("Approver is required"),
      category: Yup.string().required("Category is required"),
      subCategory: Yup.string().required("Subcategory is required"),
    }),
    onSubmit: async (values) => {
      try {
        await postMutation.mutateAsync(values);
        console.log("Submitted values:", values);
      } catch (error) {
        console.error("Task creating failed:", error);
      }
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["fetchCategory"],
    queryFn: fetchCategoriesApi,
  });

  const { data: subCategoriesData } = useQuery({
    queryKey: ["fetchSubCategories"],
    queryFn: fetchSubCategoriesApi,
  });

  return (
    <div className="flex flex-col w-[70vw] relative items-center mx-auto min-h-[600px] mt-12">
      <form
        onSubmit={formik.handleSubmit}
        className="relative w-full max-w-md p-6 space-y-8 bg-white rounded-lg shadow-xl dark:bg-gray-800"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          Create a New Post
        </h2>

        {postMutation.isLoading && (
          <div className="absolute top-0 w-full text-center text-blue-600">
            Creating post...
          </div>
        )}
        {postMutation.isError && (
          <div className="absolute top-0 w-full text-center text-red-500">
            {postMutation.error?.response?.data?.error ||
              postMutation.error?.message}
          </div>
        )}
        {postMutation.isSuccess && (
          <div className="absolute top-0 w-full text-center text-green-600">
            Post created successfully!
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            placeholder="Enter post title"
            {...formik.getFieldProps("title")}
            className={`bg-gray-50 border ${
              formik.touched.title && formik.errors.title
                ? "border-red-500"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
          />
          {formik.touched.title && formik.errors.title && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="vendor"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Vendor
          </label>
          <input
            type="text"
            id="vendor"
            placeholder="Enter vendor name"
            {...formik.getFieldProps("vendor")}
            className={`bg-gray-50 border ${
              formik.touched.vendor && formik.errors.vendor
                ? "border-red-500"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
          />
          {formik.touched.vendor && formik.errors.vendor && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.vendor}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Amount
          </label>
          <input
            type="number"
            id="amount"
            min="0.00"
            step="0.01"
            placeholder="Enter amount"
            {...formik.getFieldProps("amount")}
            className={`bg-gray-50 border ${
              formik.touched.amount && formik.errors.amount
                ? "border-red-500"
                : "border-gray-300"
            } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
          />
          {formik.touched.amount && formik.errors.amount && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.amount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="approver"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Approver
          </label>
          <select
            id="approver"
            {...formik.getFieldProps("approver")}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">--Select Approver--</option>
            <option value="TES">TES</option>
            <option value="AAB">AAB</option>
            <option value="VAS">VAS</option>
            <option value="TAA">TAA</option>
            <option value="IOS">IOS</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Category
          </label>
          <Select
            placeholder="Select a Category"
            options={categoriesData?.data?.categories?.map((category) => ({
              value: category._id,
              label: category.category,
            }))}
            onChange={(option) =>
              formik.setFieldValue("category", option.value)
            }
            className="text-sm rounded-lg"
          />
        </div>

        <div>
          <label
            htmlFor="subCategory"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Subcategory
          </label>
          <Select
            placeholder="Select a Subcategory"
            options={subCategoriesData?.data?.subCategories?.map(
              (subCategory) => ({
                value: subCategory._id,
                label: subCategory.title,
              })
            )}
            onChange={(option) =>
              formik.setFieldValue("subCategory", option.value)
            }
            className="text-sm rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating Post..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
