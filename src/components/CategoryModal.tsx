import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CreateCategoryModal } from "./CreateCategoryModal";

interface Category {
  _id: Id<"categories">;
  name: string;
  color: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    _id: Id<"transactions">;
    description: string;
    amount: number;
    direction: "credit" | "debit";
    categoryId?: Id<"categories">;
    categoryNote?: string;
  } | null;
  categories: Category[];
}

export function CategoryModal({
  isOpen,
  onClose,
  transaction,
  categories,
}: CategoryModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | undefined>();
  const [categoryNote, setCategoryNote] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateTransactionCategory = useMutation(api.transactions.updateTransactionCategory);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setSelectedCategoryId(transaction.categoryId);
      setCategoryNote(transaction.categoryNote || "");
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    setIsLoading(true);
    try {
      await updateTransactionCategory({
        transactionId: transaction._id,
        categoryId: selectedCategoryId,
        categoryNote: categoryNote.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  if (!isOpen || !transaction) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Categorize Transaction
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-sm text-gray-900">{transaction.description}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Amount:</span>
                  <p className={`text-sm font-medium ${
                    transaction.direction === "credit" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.direction === "credit" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategoryId || ""}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setIsCreateModalOpen(true);
                    } else {
                      setSelectedCategoryId((e.target.value as Id<"categories">) || undefined);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="new" className="font-medium text-primary">
                    + Create New Category
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  Note (optional)
                </label>
                <textarea
                  id="note"
                  value={categoryNote}
                  onChange={(e) => setCategoryNote(e.target.value)}
                  placeholder="Add a note about this categorization..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add context or reasoning for this categorization
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCategoryCreated={(categoryId) => {
          setSelectedCategoryId(categoryId);
          setIsCreateModalOpen(false);
        }}
      />
    </>
  );
}