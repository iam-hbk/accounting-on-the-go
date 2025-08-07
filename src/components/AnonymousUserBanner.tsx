"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RegisterForm } from "./RegisterForm";

export function AnonymousUserBanner() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const user = useQuery(api.auth.loggedInUser);

  // Don't show anything while loading
  if (user === undefined) {
    return null;
  }

  // Don't show if user is not logged in or not anonymous
  if (!user || !user.isAnonymous) {
    return null;
  }

  // Don't show if dismissed
  if (dismissed && !showRegisterForm) {
    return null;
  }

  if (showRegisterForm) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <RegisterForm onSuccess={() => setShowRegisterForm(false)} />
          </div>
          <button
            onClick={() => setShowRegisterForm(false)}
            className="text-gray-400 hover:text-gray-600 ml-4 text-xl"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              You're using a temporary account
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your data is currently stored in a temporary anonymous session. 
                Create a permanent account to keep your data safe and access it from any device.
              </p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => setShowRegisterForm(true)}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-yellow-800 hover:text-yellow-900 px-3 py-2 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-yellow-400 hover:text-yellow-600 ml-4"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
