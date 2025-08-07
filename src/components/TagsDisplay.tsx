interface TagsDisplayProps {
  tags?: string[];
  maxDisplay?: number;
}

export function TagsDisplay({ tags = [], maxDisplay = 3 }: TagsDisplayProps) {
  if (!tags || tags.length === 0) {
    return <span className="text-gray-400 text-xs">No tags</span>;
  }

  const visibleTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
          title={tag}
        >
          {tag}
        </span>
      ))}
      
      {remainingCount > 0 && (
        <span 
          className="text-xs text-gray-500 font-medium"
          title={`${remainingCount} more tags: ${tags.slice(maxDisplay).join(", ")}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
