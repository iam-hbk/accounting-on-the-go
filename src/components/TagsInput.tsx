import { useState, useRef, useEffect } from "react";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TagsInput({
  tags,
  onChange,
  placeholder = "Add tags...",
  disabled = false,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  // Predefined common tags for suggestions
  const commonTags = [
    "paid", "pending", "recurring", "business", "personal", 
    "urgent", "verified", "disputed", "refund", "bonus"
  ];

  const suggestedTags = commonTags.filter(tag => 
    !tags.includes(tag) && 
    tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div 
        className={`flex flex-wrap items-center gap-2 p-2 border rounded-lg min-h-[40px] cursor-text transition-colors ${
          isInputFocused 
            ? "border-primary ring-2 ring-primary/20" 
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}
        
        {!disabled && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={handleInputBlur}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
          />
        )}
      </div>

      {/* Tag suggestions */}
      {isInputFocused && inputValue && suggestedTags.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-32 overflow-y-auto">
          {suggestedTags.slice(0, 5).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">Add:</span>{" "}
              <span className="font-medium text-gray-900">{tag}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Press Enter or comma to add tags. Click tags to remove them.
      </p>
    </div>
  );
}
