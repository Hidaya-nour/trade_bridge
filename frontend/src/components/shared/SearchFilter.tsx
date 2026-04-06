import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchFilterProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onClear?: () => void;
  filterComponent?: React.ReactNode;
  className?: string;
}

export const SearchFilter = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  filterComponent,
  className,
}: SearchFilterProps) => {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
    onClear?.();
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9 pr-10 w-full"
          value={value}
          onChange={handleChange}
        />
        {value && (
          <Button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {filterComponent && (
        <div className="flex items-center gap-2">{filterComponent}</div>
      )}
    </div>
  );
};
