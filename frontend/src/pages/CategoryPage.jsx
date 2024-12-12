import AddCategory from "../components/AddCategory";
import AddSubCategory from "../components/AddSubCategory";

const CategoryPage = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-around items-center min-h-screen mx-1">
      <AddCategory />
      <AddSubCategory />
    </div>
  );
};

export default CategoryPage;
