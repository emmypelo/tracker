import AddCategory from "../components/AddCategory";
import AddSubCategory from "../components/AddSubCategory";

const CategoryPage = () => {
  return (
    <div className="flex flex-col md:flex-row justify-around items-center min-h-screen">
      <AddCategory />;
      <AddSubCategory />
    </div>
  );
};

export default CategoryPage;
