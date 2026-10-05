import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
}

export function StarRating({ rating }: StarRatingProps) {
  const normalizedRating = Math.min(5, Math.max(1, rating));

  return (
    <div className="flex items-center gap-1" aria-label={`${normalizedRating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < normalizedRating;

        return (
          <Star
            key={index}
            className="size-4"
            fill={filled ? "#FFD444" : "none"}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}