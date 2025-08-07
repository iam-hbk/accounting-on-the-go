import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { TransactionTable } from "./TransactionTable";
import { CategoryManager } from "./CategoryManager";
import { UncategorizedTransactions } from "./UncategorizedTransactions";
import { AnonymousUserBanner } from "./AnonymousUserBanner";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"upload" | "transactions" | "categories" | "uncategorized">("upload");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Bank Statement Analyzer
        </h1>
        <p className="text-lg text-secondary">
          Upload, parse, and categorize your financial transactions
        </p>
      </div>

      <AnonymousUserBanner />

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "upload", label: "Upload Statement" },
              { id: "transactions", label: "Transactions" },
              { id: "uncategorized", label: "Uncategorized" },
              { id: "categories", label: "Categories" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "upload" && <FileUpload />}
          {activeTab === "transactions" && <TransactionTable />}
          {activeTab === "uncategorized" && <UncategorizedTransactions />}
          {activeTab === "categories" && <CategoryManager />}
        </div>
      </div>
    </div>
  );
}
