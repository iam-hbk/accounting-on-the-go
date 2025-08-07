import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CreateCategoryModal } from "./CreateCategoryModal";

interface Category {
  _id: Id<"categories">;
  name: string;
  color: string;
}

interface CategoryDropdownProps {
  categories: Category[];
  selectedCategoryId?: Id<"categories">;
  onCategoryChange: (categoryId?: Id<"categories">) => void;
  placeholder?: string;
  onEditClick?: () => void; // New prop for opening the modal
}

export function CategoryDropdown({
  categories,
  selectedCategoryId,
  onCategoryChange,
  placeholder = "Uncategorized",
  onEditClick,
}: CategoryDropdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedCategory = categories.find(c => c._id === selectedCategoryId);

  return (
    <>
      <div className="relative flex items-center space-x-2">
        <select
          value={selectedCategoryId || ""}
          onChange={(e) => {
            if (e.target.value === "new") {
              setIsModalOpen(true);
            } else {
              onCategoryChange((e.target.value as Id<"categories">) || undefined);
            }
          }}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary focus:border-transparent min-w-[140px]"
        >
          <option value="">{placeholder}</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
          <option value="new" className="font-medium text-primary">
            + New Category
          </option>
        </select>

        {onEditClick && (
          <button
            onClick={onEditClick}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Add note or edit category"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        
        {selectedCategory && (
          <div
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedCategory.color }}
          />
        )}
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCategoryCreated={(categoryId) => {
          onCategoryChange(categoryId);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
