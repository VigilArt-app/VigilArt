import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FilterStatus } from "./types";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  filteredCount: number;
}

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filteredCount,
}: SearchAndFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by ID, date..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium mr-2">{filteredCount} images</span>
        <Button
          variant={selectedFilter === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("All")}
        >
          All
        </Button>
        <Button
          variant={selectedFilter === "Scanning" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("Scanning")}
        >
          Scanning
        </Button>
        <Button
          variant={selectedFilter === "Scanned" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("Scanned")}
        >
          Scanned
        </Button>
        <Button
          variant={selectedFilter === "Protected" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("Protected")}
        >
          Protected
        </Button>
      </div>
    </div>
  );
}
