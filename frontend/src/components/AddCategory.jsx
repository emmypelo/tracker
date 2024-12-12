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
  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <p className="mt-1 text-sm text-red-500 absolute top-0 right-4">
        {formik.errors[field]}
      </p>
    );

  return (
    <section className="  flex items-center justify-center w-full">
      <div className="w-full  space-y-8  rounded-lg shadow-xl bg-gray-800">
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

        <h2 className="text-2xl font-bold  text-white bg-slate-900 rounded-t-lg py-2">
          Add Category
        </h2>
        <form className="mt-8 px-3 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="relative">
            <label
              htmlFor="category"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Category Name
            </label>
            {renderError("category")}
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
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  bg-gray-700  border-gray-600  placeholder-gray-400  text-white`}
            />
            
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-left block mb-2 text-sm font-medium   text-white"
            >
              Description
            </label>
            <input
              type="text"
              name="description"
              id="description"
              {...formik.getFieldProps("description")}
              placeholder="Enter category description"
              className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  bg-gray-700  border-gray-600  placeholder-gray-400  text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white  rounded-lg  focus:ring-4  sm:w-auto  bg-blue-600  hover:bg-blue-700  focus:ring-blue-800"
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
