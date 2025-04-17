
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function Rating({ value, max = 5, size = "md", showValue = false }: RatingProps) {
  const roundedValue = Math.round(value * 2) / 2;
  
  const sizeClass = {
    sm: "h-3.5 w-3.5",
    md: "h-4.5 w-4.5",
    lg: "h-5.5 w-5.5",
  };
  
  return (
    <div className="flex items-center gap-1.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`transition-colors duration-200 ${sizeClass[size]} ${
            i + 1 <= roundedValue
              ? "text-yellow-400 fill-yellow-400"
              : i + 0.5 === roundedValue
              ? "text-yellow-400 fill-yellow-400 half-star"
              : "text-gray-200"
          }`}
        />
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
