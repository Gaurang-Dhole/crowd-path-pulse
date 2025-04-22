
import React, { useState, useEffect, useRef } from "react";
import { Trie, createReportSearchTrie, sampleReports } from "@/utils/trie";
import { Search } from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  density: number;
  date: string;
  solutions: string[];
}

interface ReportSearchProps {
  onSelectReport?: (report: Report) => void;
  className?: string;
}

const ReportSearch: React.FC<ReportSearchProps> = ({ 
  onSelectReport,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ word: string; data: Report }>>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const trieRef = useRef<Trie>(createReportSearchTrie());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      const results = trieRef.current.search(value);
      
      // Remove duplicates based on report ID
      const uniqueResults = results.reduce((unique: Record<string, any>, item) => {
        if (item.data && !unique[item.data.id]) {
          unique[item.data.id] = item;
        }
        return unique;
      }, {});
      
      setSuggestions(Object.values(uniqueResults));
      setIsDropdownVisible(Object.values(uniqueResults).length > 0);
    } else {
      setSuggestions([]);
      setIsDropdownVisible(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (report: Report) => {
    setSelectedReport(report);
    setSearchTerm(report.title);
    setIsDropdownVisible(false);
    
    if (onSelectReport) {
      onSelectReport(report);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            placeholder="Search historical reports..."
            aria-label="Search historical reports"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={isDropdownVisible}
          />
        </div>
        
        {isDropdownVisible && (
          <div 
            ref={dropdownRef}
            id="search-suggestions"
            className="absolute z-10 mt-14 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-auto"
            role="listbox"
          >
            {suggestions.map((item, index) => (
              <div
                key={item.data.id}
                onClick={() => handleSelectSuggestion(item.data)}
                className="px-4 py-3 hover:bg-muted cursor-pointer border-b last:border-0"
                role="option"
                aria-selected={selectedReport?.id === item.data.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelectSuggestion(item.data);
                }}
              >
                <div className="font-medium">{item.data.title}</div>
                <div className="text-sm text-muted-foreground">{item.data.date}</div>
              </div>
            ))}
          </div>
        )}
        
        {selectedReport && (
          <div className="bg-white p-4 rounded-md border border-gray-200 mt-4 animate-fade-in">
            <h3 className="font-bold text-lg mb-2">{selectedReport.title}</h3>
            <p className="text-muted-foreground mb-2">{selectedReport.description}</p>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm">
                <span className="font-medium">Date:</span> {selectedReport.date}
              </span>
              <span className="text-sm">
                <span className="font-medium">Peak Density:</span> {selectedReport.density} people/m²
              </span>
            </div>
            
            <div className="mt-3">
              <h4 className="font-medium text-sm mb-1">Implemented Solutions:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {selectedReport.solutions.map((solution, idx) => (
                  <li key={idx}>{solution}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSearch;
