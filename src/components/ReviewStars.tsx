import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStarsProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ReviewStars({ value, onChange, disabled = false }: ReviewStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const currentValue = hoverValue ?? value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const active = currentValue >= starValue;

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            aria-label={`Seleccionar ${starValue} estrellas`}
            onMouseEnter={() => !disabled && setHoverValue(starValue)}
            onMouseLeave={() => !disabled && setHoverValue(null)}
            onClick={() => !disabled && onChange(starValue)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-all duration-200",
                active ? "fill-primary text-primary" : "text-muted-foreground/70 hover:text-primary",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
