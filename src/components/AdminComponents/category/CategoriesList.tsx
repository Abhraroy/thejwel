"use client"

import React, { useState } from 'react';
import { Category, deleteCategory, createSubCategory, updateSubCategory, deleteSubCategory } from '../../../app/(admin)/admin/actions/categories';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useAdminStore from "../../../zustandStore/AdminZustandStore";

const PlusIcon = ({ className = 'w-5 h-5' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
  
  const ImageIcon = ({ className = 'w-5 h-5' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
  
  const EditIcon = ({ className = 'w-4 h-4' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" />
    </svg>
  );
  
  const DeleteIcon = ({ className = 'w-4 h-4' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );

  


export default function CategoriesList({ category, isDarkTheme }: { category: Category, isDarkTheme: boolean }) {
  const router = useRouter();
  const { setShowAddCategory, setSelectedCategory } = useAdminStore();
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [subCategories, setSubCategories] = useState<[]>([]);
  const [subcategory_image_url_preview, setSubcategoryImageUrlPreview] = useState<string | null>(null);
  const [isEditingSubCategory, setIsEditingSubCategory] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    subcategory_id: '' as string | null,
    subcategory_name: '',
    category_id:'',
    subcategory_image_url: null as File | string | null,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleEdit = (categoryToEdit: Category) => {
    // Open the same category form in edit mode (overlay) like products
    setSelectedCategory(categoryToEdit);
    setShowAddCategory(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const result = await deleteCategory(categoryId);
        if (result.success) {
          router.refresh();
        } else {
          alert(`Failed to delete category: ${result.error}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('An unexpected error occurred while deleting the category.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from sub category name
      // if (name === 'sub_category_name') {
      //   updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // }
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      console.log("image status after uploading to cloudflare", previewUrl)
      setFormData((prev) => ({
        ...prev,
        subcategory_image_url: file,
        
      }));
      setSubcategoryImageUrlPreview(previewUrl)
    }
  };

  const removeImage = () => {
    if (formData.subcategory_image_url) {
      URL.revokeObjectURL(formData.subcategory_image_url.toString() || '');
    }
    setFormData((prev) => ({
      ...prev,
      subcategory_image_url: null,
    }));
    setSubcategoryImageUrlPreview(null)
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          subcategory_image_url: file,
          subcategory_image_url_preview: previewUrl,
        }));
      }
    }
  };

  const handleCancel = () => {
    if (formData.subcategory_image_url) {
      URL.revokeObjectURL(formData.subcategory_image_url.toString() || '');
    }
    setFormData({
      subcategory_id: '',
      subcategory_name: '',
      category_id:'',
      subcategory_image_url: null,
      is_active: true,
    });
    setSubcategoryImageUrlPreview(null)
    setShowAddSubCategory(false);
  };

  const handleSubmit =
    (category_id: string) =>
    async (e: React.SubmitEvent) => {
      e.preventDefault();
      setSubmitting(true);
      console.log("category_id", category_id);
      console.log("Subcategory form data:", formData);

      try {
        let imageUrl: string | undefined = undefined;

      // Upload image via API if it's a new file
      if (formData.subcategory_image_url instanceof File) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", formData.subcategory_image_url);
        formDataToSend.append("folder", "sub_categories");

        const response = await axios.post("/admin/api/uploadImage", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!response.data.success || !response.data.url) {
          throw new Error(response.data.error || "Image upload failed");
        }

        imageUrl = response.data.url;
      } else if (typeof formData.subcategory_image_url === 'string') {
        // If it's already a URL (editing mode), use it as is
        imageUrl = formData.subcategory_image_url;
      }

      const formDataWithCategoryId = {
        ...formData,
        category_id: category_id,
        subcategory_image_url: imageUrl || formData.subcategory_image_url
      }
      console.log("formDataWithCategoryId",formDataWithCategoryId)
      
      if(isEditingSubCategory){
        const result = await updateSubCategory(formDataWithCategoryId)
        console.log("result of update sub category",result)
        if(result.success){
          router.refresh();
          handleCancel();
          setShowAddSubCategory(false)
          setSubmitting(false);
          return;
        }else{
          alert(`Failed to update sub category: ${result?.error}`)
          setSubmitting(false);
          return;
        }
      }

      const result = await createSubCategory(formDataWithCategoryId)
      if(result.success){
        router.refresh();
        handleCancel();
        setShowAddSubCategory(false)
      }else{
        alert(`Failed to create sub category: ${result?.error}`)
      }
      } catch (error) {
        console.error("Submit error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleEditSubCategory = (subcategory_id: string,subcategory_name: string,subcategory_image_url: string,subcategory_image_url_preview: string,is_active: boolean) => {
    console.log("subcategory_id",subcategory_id)
    if(subcategory_id){
      setFormData({
        subcategory_id: subcategory_id,
        subcategory_name: subcategory_name,
        category_id:'',
        subcategory_image_url: subcategory_image_url,
        is_active: is_active
      })
      setIsEditingSubCategory(true)
      setShowAddSubCategory(true)
    }
  }
  const handleDeleteSubCategory = async (subcategory_id: string) => {
    if (confirm('Are you sure you want to delete this sub category? This action cannot be undone.')) {
      const result = await deleteSubCategory(subcategory_id)
      if(result.success){
        router.refresh();
      }else{
        alert(`Failed to delete sub category: ${result?.error}`)
      }
    }
  }
  return (
    <>
        <React.Fragment key={category.category_id}>
              <tr
                
                className={`border-b hover:bg-opacity-50 transition-colors ${
                  isDarkTheme ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {/* Image */}
                <td className="py-3 px-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {category.category_image_url ? (
                      <img
                        src={category.category_image_url}
                        alt={category.category_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className={`w-6 h-6 ${isDarkTheme ? 'text-gray-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                </td>
    
                {/* Category Name */}
                <td className={`py-3 px-4 font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  {category.category_name}
                </td>
    
                {/* Slug */}
                <td className={`py-3 px-4 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category.slug}
                </td>
    
                {/* Description */}
                <td className={`py-3 px-4 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="max-w-xs truncate" title={category.description || ''}>
                    {category.description || '—'}
                  </div>
                </td>
    
                {/* Status */}
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    category.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
    
                {/* Actions */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkTheme
                          ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                      title="Edit"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.category_id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkTheme
                          ? 'hover:bg-red-900 text-red-400 hover:text-red-300'
                          : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                      }`}
                      title="Delete"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      className={`p-2 bg-gray-300 text-black rounded-lg transition-colors ${
                        isDarkTheme
                          ? 'hover:bg-gray-100  hover:text-black'
                          : 'hover:bg-gray-700  hover:text-white'
                      }`}
                      title="Edit Sub Category"
                      onClick={() => setShowSubCategories(!showSubCategories)}
                    >
                      {showSubCategories ? 'Hide' : 'Show'} 
                    </button>
                  </div>
                </td>
              </tr>
              { !showAddSubCategory &&showSubCategories && <>
                  <tr className={`${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <td className="py-4 px-4">
                      <span className={`text-[1rem] font-bold ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sub Categories
                      </span>
                    </td>
                  </tr>
                 
                    <tr>
                    <td colSpan={1} className="py-4 px-4 pl-8 text-center">
                      <div className="flex flex-col gap-2 justify-start items-start">
                        {category?.sub_categories?.length > 0 ? 
                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Render subcategories here when available */}
                            <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                              {category.sub_categories.length} sub categor{category.sub_categories.length === 1 ? 'y' : 'ies'}
                            </span>
                          
                          </div>
                         : 
                          <span className={`text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                            No sub categories added yet.
                          </span>
                        }
                      </div>
                    </td>
                  </tr>
                 {
                  category?.sub_categories?.length > 0 && category?.sub_categories?.map((subCategory:any)=>(
                    <tr key={subCategory.subcategory_id}>
                      <td colSpan={7} className="py-4 px-4 text-center border-b-3 border-t-3 border-gray-200">
                        <div className="flex flex-row items-center justify-around">
                         <div className='w-1/4' > <img src={subCategory.subcategory_image_url} alt={subCategory.subcategory_name} className="w-20 h-20 rounded-full shrink-0 " /></div>
                          <div className='w-1/4 flex items-center justify-center'>
                            <span className={`text-[1rem] shrink-0 font-bold ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                              {subCategory.subcategory_name}
                            </span>
                          </div>
                          <div className='w-1/4 flex items-center justify-center'>
                            <span className={`text-sm shrink-0 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} bg-green-400 px-2 py-1 rounded-md`}>
                              {subCategory.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="w-1/4 flex items-center justify-center shrink-0">
                            <button className={`p-2 rounded-lg transition-colors ${
                              isDarkTheme
                                ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            }`}
                            onClick={() => handleEditSubCategory(subCategory.subcategory_id,subCategory.subcategory_name,subCategory.subcategory_image_url,subCategory.subcategory_image_url_preview,subCategory.is_active)}
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button className={`p-2 rounded-lg transition-colors ${
                              isDarkTheme
                                ? 'hover:bg-red-900 text-red-400 hover:text-red-300'
                                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                            }`}
                             onClick={() => handleDeleteSubCategory(subCategory.subcategory_id)}
                            >
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                 }
                 
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center">
                      <div className="flex flex-col gap-2 items-center">
                        <button
                          className={`p-2 bg-gray-300 text-black rounded-lg transition-colors ${
                            isDarkTheme
                              ? 'hover:bg-gray-100  hover:text-black'
                              : 'hover:bg-gray-700  hover:text-white'
                          }`}
                          title="Add Sub Category"
                          onClick={() => setShowAddSubCategory(!showAddSubCategory)}
                        >
                          Add Sub Category
                        </button>
                      </div>
                    </td>
                  </tr>
              </>}
              {showAddSubCategory && (
                <>
                  <tr className={`${isDarkTheme ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    <td colSpan={7} className="py-6 px-6">
                      <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
                        <h3 className={`text-xl font-semibold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                          Add New Sub Category
                        </h3>
                        
                        <form onSubmit={handleSubmit(category.category_id)} className="space-y-6">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                                Sub Category Name *
                              </label>
                              <input
                                type="text"
                                name="subcategory_name"
                                value={formData.subcategory_name}
                                onChange={handleInputChange}
                                placeholder="e.g., Gold Rings, Silver Necklaces"
                                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                                  isDarkTheme
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-[#E94E8B]`}
                                required
                              />
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="is_active_sub"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-4 h-4 text-[#E94E8B] bg-gray-100 border-gray-300 rounded focus:ring-[#E94E8B] focus:ring-2"
                              />
                              <label
                                htmlFor="is_active_sub"
                                className={`ml-2 text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
                              >
                                Active
                              </label>
                            </div>
                          </div>

                          {/* Sub Category Image */}
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                              Sub Category Image
                            </label>
                            {!subcategory_image_url_preview ? (
                              <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                  isDarkTheme ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                              >
                                <ImageIcon
                                  className={`w-12 h-12 mx-auto mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`}
                                />
                                <p className={`mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                                  PNG, JPG, WEBP up to 5MB
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  id="sub-category-image-upload"
                                />
                                <label
                                  htmlFor="sub-category-image-upload"
                                  className="mt-4 inline-block px-4 py-2 bg-[#E94E8B] text-white rounded-lg cursor-pointer hover:bg-[#d43d75] transition-colors"
                                >
                                  Select Image
                                </label>
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={subcategory_image_url_preview}
                                  alt="Sub category preview"
                                  className="w-full h-48 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <DeleteIcon className="w-4 h-4" />
                                </button>
                                <div className={`mt-2 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Image uploaded successfully
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Form Actions */}
                          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={handleCancel}
                              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                isDarkTheme
                                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="px-6 py-2 bg-[#E94E8B] text-white rounded-lg font-medium hover:bg-[#d43d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? 'Saving...' : 'Add Sub Category'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </td>
                  </tr>
                </>
              )}

        </React.Fragment>
    </>
  )
}
