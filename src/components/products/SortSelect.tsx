"use client";
import { useRouter, usePathname } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  sortOptions: SortOption[];
  currentSort?: string;
  label: string;
}

export function SortSelect({ sortOptions, currentSort, label }: SortSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(currentSort || 'newest');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (sortValue: string) => {
    setSelectedSort(sortValue);
    setIsOpen(false);
    
    // Update URL with new sort parameter
    const url = new URL(window.location.href);
    url.searchParams.set('sort', sortValue);
    url.searchParams.set('page', '1'); // Reset to first page when sorting
    router.push(url.pathname + url.search as any);
  };

  const currentLabel = sortOptions.find(option => option.value === selectedSort)?.label || label;

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-foreground hidden sm:inline">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-between w-full sm:w-48 px-3 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted hover:border-border/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`absolute z-10 w-full sm:w-48 top-full left-0 mt-1 bg-background border border-border/60 rounded-lg shadow-xl transition-all duration-200 ease-out backdrop-blur-sm ${
            isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'
          }`}>
          <ul className="py-1">
            {sortOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors rounded-sm mx-1 ${
                    selectedSort === option.value ? 'bg-primary text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}