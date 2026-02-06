
import CategoryHeader from "../../../../components/AdminComponents/category/CategoryHeader";
import CategoriesList from "@/components/AdminComponents/category/CategoriesList";
import Categories from "@/components/AdminComponents/category/Categories";
import { getCategories } from "./action";
export default async function CategoriesPage() {
  const isDarkTheme = false;

  const { success, data: categoriesData, message } = await getCategories();
  if (!success) {
    console.error('Error fetching categories:', message);
    return <div>Error fetching categories: {message}</div>;
  }

  return <>
    <div className="p-6">
      <CategoryHeader isDarkTheme={false} />
      <Categories isDarkTheme={false} />
      <div
        className={`${isDarkTheme ? 'bg-black border border-gray-700' : 'bg-white'
          } rounded-lg shadow p-6`}
      >
        <h2 className={`text-xl font-semibold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Main Categories ({categoriesData?.length || 0})
        </h2>
        <p className={`text-sm mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your jewelry categories.
        </p>

        {categoriesData?.length === 0 ? (
          <div className={`text-center py-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            No categories added yet. Click &quot;Add Category&quot; to create your first category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Image
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category Name
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Slug
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sub Categories
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoriesData?.map((category: any) => (
                  <CategoriesList key={category.category_id} category={category} isDarkTheme={isDarkTheme} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </>
}

