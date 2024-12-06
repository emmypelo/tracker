// import { useState, useEffect } from "react";
// import { classNames } from "primereact/utils";
// import { FilterMatchMode, FilterOperator } from "primereact/api";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { InputText } from "primereact/inputtext";
// import { IconField } from "primereact/iconfield";
// import { InputIcon } from "primereact/inputicon";
// import { Dropdown } from "primereact/dropdown";
// import { MultiSelect } from "primereact/multiselect";
// import { Tag } from "primereact/tag";
// import { TriStateCheckbox } from "primereact/tristatecheckbox";

// export default function TaskTable() {
//   // Customers
//   const [title, setTitle] = useState(null);
//   // basic filter
//   const [filters, setFilters] = useState({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     approved: { value: null, matchMode: FilterMatchMode.EQUALS },
//     approver: { value: null, matchMode: FilterMatchMode.EQUALS },
//     payment: { value: null, matchMode: FilterMatchMode.EQUALS },
//     category: { value: null, matchMode: FilterMatchMode.EQUALS },
//     subCategory: { value: null, matchMode: FilterMatchMode.EQUALS },
//   });
//   // Loading state
//   const [loading, setLoading] = useState(true);
//   const [globalFilterValue, setGlobalFilterValue] = useState("");

//   const [approved] = useState(["approved", "pending"]);

//   const onGlobalFilterChange = (e) => {
//     const value = e.target.value;
//     let _filters = { ...filters };

//     _filters["global"].value = value;

//     setFilters(_filters);
//     setGlobalFilterValue(value);
//   };
//   // Header
//   const renderHeader = () => {
//     return (
//       <div className="flex justify-content-end">
//         <IconField iconPosition="left">
//           <InputIcon className="pi pi-search" />
//           <InputText
//             value={globalFilterValue}
//             onChange={onGlobalFilterChange}
//             placeholder="Keyword Search"
//           />
//         </IconField>
//       </div>
//     );
//   };
//   // Body of table
//   const countryBodyTemplate = (rowData) => {
//     return (
//       <div className="flex align-items-center gap-2">
//         <span>{rowData.country.name}</span>
//       </div>
//     );
//   };

//   const representativeBodyTemplate = (rowData) => {
//     const representative = rowData.representative;

//     return (
//       <div className="flex align-items-center gap-2">
//         <img
//           alt={representative.name}
//           src={`https://primefaces.org/cdn/primereact/images/avatar/${representative.image}`}
//           width="32"
//         />
//         <span>{representative.name}</span>
//       </div>
//     );
//   };

//   const representativesItemTemplate = (option) => {
//     return (
//       <div className="flex align-items-center gap-2">
//         <img
//           alt={option.name}
//           src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`}
//           width="32"
//         />
//         <span>{option.name}</span>
//       </div>
//     );
//   };

//   const statusBodyTemplate = (rowData) => {
//     return (
//       <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
//     );
//   };

//   const statusItemTemplate = (option) => {
//     return <Tag value={option} severity={getSeverity(option)} />;
//   };

//   const verifiedBodyTemplate = (rowData) => {
//     return (
//       <i
//         className={classNames("pi", {
//           "true-icon pi-check-circle": rowData.verified,
//           "false-icon pi-times-circle": !rowData.verified,
//         })}
//       ></i>
//     );
//   };

//   const representativeRowFilterTemplate = (options) => {
//     return (
//       <MultiSelect
//         value={options.value}
//         options={representatives}
//         itemTemplate={representativesItemTemplate}
//         onChange={(e) => options.filterApplyCallback(e.value)}
//         optionLabel="name"
//         placeholder="Any"
//         className="p-column-filter"
//         maxSelectedLabels={1}
//         style={{ minWidth: "14rem" }}
//       />
//     );
//   };

//   const statusRowFilterTemplate = (options) => {
//     return (
//       <Dropdown
//         value={options.value}
//         options={statuses}
//         onChange={(e) => options.filterApplyCallback(e.value)}
//         itemTemplate={statusItemTemplate}
//         placeholder="Select One"
//         className="p-column-filter"
//         showClear
//         style={{ minWidth: "12rem" }}
//       />
//     );
//   };

//   const verifiedRowFilterTemplate = (options) => {
//     return (
//       <TriStateCheckbox
//         value={options.value}
//         onChange={(e) => options.filterApplyCallback(e.value)}
//       />
//     );
//   };

//   const header = renderHeader();

//   return (
//     <div className="card">
//       <DataTable
//         value={customers}
//         paginator
//         rows={10}
//         dataKey="id"
//         filters={filters}
//         filterDisplay="row"
//         loading={loading}
//         globalFilterFields={[
//           "name",
//           "country.name",
//           "representative.name",
//           "status",
//         ]}
//         header={header}
//         emptyMessage="No customers found."
//       >
//         <Column
//           field="name"
//           header="Name"
//           filter
//           filterPlaceholder="Search by name"
//           style={{ minWidth: "12rem" }}
//         />
//         <Column
//           header="Country"
//           filterField="country.name"
//           style={{ minWidth: "12rem" }}
//           body={countryBodyTemplate}
//           filter
//           filterPlaceholder="Search by country"
//         />
//         <Column
//           header="Agent"
//           filterField="representative"
//           showFilterMenu={false}
//           filterMenuStyle={{ width: "14rem" }}
//           style={{ minWidth: "14rem" }}
//           body={representativeBodyTemplate}
//           filter
//           filterElement={representativeRowFilterTemplate}
//         />
//         <Column
//           field="status"
//           header="Status"
//           showFilterMenu={false}
//           filterMenuStyle={{ width: "14rem" }}
//           style={{ minWidth: "12rem" }}
//           body={statusBodyTemplate}
//           filter
//           filterElement={statusRowFilterTemplate}
//         />
//         <Column
//           field="verified"
//           header="Verified"
//           dataType="boolean"
//           style={{ minWidth: "6rem" }}
//           body={verifiedBodyTemplate}
//           filter
//           filterElement={verifiedRowFilterTemplate}
//         />
//       </DataTable>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { fetchTasksApi, updateTaskApi } from "../APIrequests/taskAPI";
// import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
// import { fetchSubCategoriesApi } from "../APIrequests/subCategoryAPI";
// import * as Yup from "yup";
// import { useFormik } from "formik";
// import { useParams } from "react-router-dom";

// const FetchTask = () => {
//   const [editingRowId, setEditingRowId] = useState(null);
//   const [editValues, setEditValues] = useState({});
//   const [filters, setFilters] = useState({
//     category: "",
//     subCategory: "",
//     title: "",
//     isApproved: "",
//     isPaid: "",
//     isCompleted: "",
//     startDate: "",
//     endDate: "",
//   });
//   const [searchTerm, setSearchTerm] = useState("");

//   const { taskId } = useParams();

//   const {
//     isLoading: isTasksLoading,
//     isError: isTasksError,
//     data: tasksData,
//     error: tasksError,
//     refetch: taskRefetch,
//   } = useQuery({
//     queryKey: ["fetchTasks", filters],
//     queryFn: () => fetchTasksApi(filters),
//     keepPreviousData: true,
//   });

//   const { data: categoriesData } = useQuery({
//     queryKey: ["fetchCategories"],
//     queryFn: fetchCategoriesApi,
//   });

//   const { data: subCategoriesData } = useQuery({
//     queryKey: ["fetchSubCategories"],
//     queryFn: fetchSubCategoriesApi,
//   });

//   const taskMutation = useMutation({
//     mutationKey: ["updateTask"],
//     mutationFn: updateTaskApi,
//     onSuccess: () => {
//       setEditingRowId(null);
//       taskRefetch();
//     },
//   });

//   const handleEditChange = (key, value) => {
//     setEditValues((prev) => ({ ...prev, [key]: value }));
//   };

//   const startEditing = (task) => {
//     setEditingRowId(task._id);
//     setEditValues({
//       isApproved: task.isApproved,
//       isPaid: task.isPaid,
//       isCompleted: task.isCompleted,
//     });
//   };

//   const saveChanges = () => {
//     const updateData = {
//       ...editValues,
//       taskId: editingRowId,
//     };
//     taskMutation.mutate(updateData);
//   };

//   const cancelEditing = () => {
//     setEditingRowId(null);
//     setEditValues({});
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setFilters({ ...filters, title: searchTerm });
//     taskRefetch();
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilters({
//       category: "",
//       subCategory: "",
//       title: "",
//       isApproved: "",
//       isPaid: "",
//       isCompleted: "",
//       startDate: "",
//       endDate: "",
//     });
//   };

//   if (isTasksLoading) return <h2>Loading tasks...</h2>;
//   if (isTasksError)
//     return <h2>Error: {tasksError.message || "Something went wrong"}</h2>;
//   if (!tasksData?.data?.tasks?.length) return <h2>No tasks found</h2>;

//   const tasks = tasksData?.data?.tasks || [];
//   const categories = categoriesData?.data?.categories || [];
//   const subCategories = subCategoriesData?.data?.subCategories || [];

//   return (
//     <div className="mt-24 lg:mt-28">
//       {/* Filter Section */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4">
//           <input
//             type="text"
//             placeholder="Search by title"
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="border p-2 rounded flex justify-between w-1/2 md:w-1/4"
//           />
//           <select
//             value={filters.category}
//             onChange={(e) => handleFilterChange("category", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">All Categories</option>
//             {categories?.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.category}
//               </option>
//             ))}
//           </select>
//           <select
//             value={filters.subCategory}
//             onChange={(e) => handleFilterChange("subCategory", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">All SubCategories</option>
//             {subCategories?.map((sub) => (
//               <option key={sub._id} value={sub._id}>
//                 {sub.title}
//               </option>
//             ))}
//           </select>
//           <div className="flex items-center gap-2">
//             <label htmlFor="from">From:</label>
//             <input
//               type="date"
//               value={filters.startDate}
//               onChange={(e) => handleFilterChange("startDate", e.target.value)}
//               className="border p-2 rounded"
//               name="from"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <label htmlFor="to">To:</label>
//             <input
//               type="date"
//               value={filters.endDate}
//               onChange={(e) => handleFilterChange("endDate", e.target.value)}
//               className="border p-2 rounded"
//               name="to"
//             />
//           </div>
//           <select
//             value={filters.isApproved}
//             onChange={(e) => handleFilterChange("isApproved", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Approval Status</option>
//             <option value="true">Approved</option>
//             <option value="false">Pending</option>
//           </select>
//           <select
//             value={filters.isPaid}
//             onChange={(e) => handleFilterChange("isPaid", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Payment Status</option>
//             <option value="true">Paid</option>
//             <option value="false">Pending</option>
//           </select>
//           <select
//             value={filters.isCompleted}
//             onChange={(e) => handleFilterChange("isCompleted", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Completion Status</option>
//             <option value="true">Completed</option>
//             <option value="false">Pending</option>
//           </select>
//           <button
//             type="submit"
//             className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//           >
//             Search
//           </button>
//           <button
//             type="button"
//             onClick={clearFilters}
//             className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
//           >
//             Clear Filters
//           </button>
//         </form>
//       </div>

//       {/* Table Section */}
//       <table className="min-w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border px-1 py-2">S/N</th>
//             <th className="border px-4 py-2">Title</th>
//             <th className="border px-4 py-2">Category</th>
//             <th className="border px-4 py-2">SubCategory</th>
//             <th className="border px-4 py-2">Approved</th>
//             <th className="border px-4 py-2">Paid</th>
//             <th className="border px-4 py-2">Completed</th>
//             <th className="border px-4 py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tasks.map((task, index) => (
//             <tr key={task._id} className="hover:bg-gray-100">
//               <td className="border px-1 py-2">{index + 1}</td>
//               <td className="border px-4 py-2">{task.title}</td>
//               <td className="border px-4 py-2">
//                 {task.category?.category || "Uncategorized"}
//               </td>
//               <td className="border px-4 py-2">
//                 {task.subCategory?.title || "Uncategorized"}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <select
//                     value={editValues.isApproved}
//                     onChange={(e) =>
//                       handleEditChange("isApproved", e.target.value === "true")
//                     }
//                   >
//                     <option value="true">Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                 ) : task.isApproved ? (
//                   "Yes"
//                 ) : (
//                   "No"
//                 )}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <select
//                     value={editValues.isPaid}
//                     onChange={(e) =>
//                       handleEditChange("isPaid", e.target.value === "true")
//                     }
//                   >
//                     <option value="true">Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                 ) : task.isPaid ? (
//                   "Yes"
//                 ) : (
//                   "No"
//                 )}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <select
//                     value={editValues.isCompleted}
//                     onChange={(e) =>
//                       handleEditChange("isCompleted", e.target.value === "true")
//                     }
//                   >
//                     <option value="true">Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                 ) : task.isCompleted ? (
//                   "Yes"
//                 ) : (
//                   "No"
//                 )}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <>
//                     <button
//                       onClick={saveChanges}
//                       className="bg-green-500 text-white px-2 py-1 rounded mr-2"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={cancelEditing}
//                       className="bg-gray-500 text-white px-2 py-1 rounded"
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={() => startEditing(task)}
//                     className="bg-blue-500 text-white px-2 py-1 rounded"
//                   >
//                     Edit
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default FetchTask;




// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { fetchTasksApi, updateTaskApi } from "../APIrequests/taskAPI";
// import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
// import { fetchSubCategoriesApi } from "../APIrequests/subCategoryAPI";

// const FetchTask = () => {
//   const [editingRowId, setEditingRowId] = useState(null);
//   const [editValues, setEditValues] = useState({});
//   const [filters, setFilters] = useState({
//     category: "",
//     subCategory: "",
//     title: "",
//     isApproved: "",
//     isPaid: "",
//     isCompleted: "",
//     startDate: "",
//     endDate: "",
//   });
//   const [searchTerm, setSearchTerm] = useState("");

//   const {
//     isLoading: isTasksLoading,
//     isError: isTasksError,
//     data: tasksData,
//     error: tasksError,
//     refetch: taskRefetch,
//   } = useQuery({
//     queryKey: ["fetchTasks", filters],
//     queryFn: () => fetchTasksApi(filters),
//     keepPreviousData: true,
//   });

//   const { data: categoriesData } = useQuery({
//     queryKey: ["fetchCategories"],
//     queryFn: fetchCategoriesApi,
//   });

//   const { data: subCategoriesData } = useQuery({
//     queryKey: ["fetchSubCategories"],
//     queryFn: fetchSubCategoriesApi,
//   });

//   const tasks = tasksData?.data?.tasks;
//   const categories = categoriesData?.data?.categories;
//   const subCategories = subCategoriesData?.data?.subCategories;

//   // Refetch tasks when filters change
//   useEffect(() => {
//     taskRefetch();
//   }, [filters, taskRefetch]);

//   const handleFilterChange = (key, value) => {
//     setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setFilters({ ...filters, title: searchTerm });
//     taskRefetch();
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilters({
//       category: "",
//       subCategory: "",
//       title: "",
//       isApproved: "",
//       isPaid: "",
//       isCompleted: "",
//       startDate: "",
//       endDate: "",
//     });
//   };

//   // Edit functionality
//   const startEditing = (task) => {
//     setEditingRowId(task._id);
//     setEditValues({
//       isApproved: task.isApproved,
//       isPaid: task.isPaid,
//       isCompleted: task.isCompleted,
//     });
//   };

//   const handleEditChange = (key, value) => {
//     setEditValues((prev) => ({ ...prev, [key]: value }));
//   };

//   const saveChanges = async () => {
//     try {
//       const updateData = {
//         taskId: editingRowId,
//         ...editValues,
//       };
//       await updateTaskApi(updateData);
//       setEditingRowId(null);
//       setEditValues({});
//       taskRefetch(); // Refetch tasks after saving changes
//     } catch (error) {
//       console.error("Failed to update task:", error);
//     }
//   };

//   const cancelEditing = () => {
//     setEditingRowId(null);
//     setEditValues({});
//   };

//   if (isTasksLoading) return <h2>Loading tasks...</h2>;
//   if (isTasksError)
//     return <h2>Error: {tasksError.message || "Something went wrong"}</h2>;
//   if (!tasksData?.data?.tasks?.length) return <h2>No tasks found</h2>;

//   return (
//     <div className="mt-24 lg:mt-28">
//       {/* Filter Section */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4">
//           <input
//             type="text"
//             placeholder="Search by title"
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="border p-2 rounded flex justify-between w-1/2 md:w-1/4"
//           />
//           <select
//             value={filters.category}
//             onChange={(e) => handleFilterChange("category", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">All Categories</option>
//             {categories?.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.category}
//               </option>
//             ))}
//           </select>
//           <select
//             value={filters.subCategory}
//             onChange={(e) => handleFilterChange("subCategory", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">All SubCategories</option>
//             {subCategories?.map((sub) => (
//               <option key={sub._id} value={sub._id}>
//                 {sub.title}
//               </option>
//             ))}
//           </select>
//           <div className="flex items-center gap-2">
//             <label htmlFor="from">From:</label>
//             <input
//               type="date"
//               value={filters.startDate}
//               onChange={(e) => handleFilterChange("startDate", e.target.value)}
//               className="border p-2 rounded"
//               name="from"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <label htmlFor="to">To:</label>
//             <input
//               type="date"
//               value={filters.endDate}
//               onChange={(e) => handleFilterChange("endDate", e.target.value)}
//               className="border p-2 rounded"
//               name="to"
//             />
//           </div>
//           <select
//             value={filters.isApproved}
//             onChange={(e) => handleFilterChange("isApproved", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Approval Status</option>
//             <option value="true">Approved</option>
//             <option value="false">Pending</option>
//           </select>
//           <select
//             value={filters.isPaid}
//             onChange={(e) => handleFilterChange("isPaid", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Payment Status</option>
//             <option value="true">Paid</option>
//             <option value="false">Pending</option>
//           </select>
//           <select
//             value={filters.isCompleted}
//             onChange={(e) => handleFilterChange("isCompleted", e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Completion Status</option>
//             <option value="true">Completed</option>
//             <option value="false">Pending</option>
//           </select>
//           <button
//             type="submit"
//             className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//           >
//             Search
//           </button>
//           <button
//             type="button"
//             onClick={clearFilters}
//             className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
//           >
//             Clear Filters
//           </button>
//         </form>
//       </div>

//       {/* Table Section */}
//       <table className="min-w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border px-1 py-2">S/N</th>
//             <th className="border px-4 py-2">Title</th>
//             <th className="border px-4 py-2">Category</th>
//             <th className="border px-4 py-2">SubCategory</th>
//             <th className="border px-4 py-2">Approved</th>
//             <th className="border px-4 py-2">Paid</th>
//             <th className="border px-4 py-2">Completed</th>
//             <th className="border px-4 py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tasks.map((task, index) => (
//             <tr key={task._id} className="hover:bg-gray-100">
//               <td className="border px-1 py-2">{index + 1}</td>
//               <td className="border px-4 py-2">{task.title}</td>
//               <td className="border px-4 py-2">
//                 {task.category?.category || "Uncategorized"}
//               </td>
//               <td className="border px-4 py-2">
//                 {task.subCategory?.title || "Uncategorized"}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <select
//                     value={editValues.isApproved}
//                     onChange={(e) =>
//                       handleEditChange("isApproved", e.target.value === "true")
//                     }
//                   >
//                     <option value="true">Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                 ) : task.isApproved ? (
//                   "Yes"
//                 ) : (
//                   "No"
//                 )}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <select
//                     value={editValues.isPaid}
//                     onChange={(e) =>
//                       handleEditChange("isPaid", e.target.value === "true")
//                     }
//                   >
//                     <option value={true}>Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                 ) : task.isPaid ? (
//                   "Yes"
//                 ) : (
//                   "No"
//                 )}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <select
//                     value={editValues.isCompleted}
//                     onChange={(e) =>
//                       handleEditChange("isCompleted", e.target.value === "true")
//                     }
//                   >
//                     <option value="true">Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                 ) : task.isCompleted ? (
//                   "Yes"
//                 ) : (
//                   "No"
//                 )}
//               </td>
//               <td className="border px-4 py-2">
//                 {editingRowId === task._id ? (
//                   <>
//                     <button
//                       onClick={saveChanges}
//                       className="bg-green-500 text-white px-2 py-1 rounded mr-2"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={cancelEditing}
//                       className="bg-gray-500 text-white px-2 py-1 rounded"
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={() => startEditing(task)}
//                     className="bg-blue-500 text-white px-2 py-1 rounded"
//                   >
//                     Edit
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default FetchTask;
