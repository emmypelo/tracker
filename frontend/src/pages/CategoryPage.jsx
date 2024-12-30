import AddCategory from "../components/tasks/AddCategory";


const CategoryPage = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-around items-center min-h-screen mx-1">
      <AddCategory />
      
    </div>
  );
};

export default CategoryPage;
