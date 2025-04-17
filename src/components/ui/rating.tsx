
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function Rating({ value, max = 5, size = "md", showValue = false }: RatingProps) {
  const roundedValue = Math.round(value * 2) / 2; // Round to nearest 0.5
  
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass[size]} ${
            i + 1 <= roundedValue
              ? "text-yellow-500 fill-yellow-500"
              : i + 0.5 === roundedValue
              ? "text-yellow-500 fill-yellow-500 half-star"
              : "text-gray-300"
          }`}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
