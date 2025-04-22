
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { exportAsJson, exportAsCsv, prepareSimulationExport } from "@/utils/exportData";

interface ExportButtonProps {
  data: any;
  simulationConfig?: any;
  className?: string;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  simulationConfig,
  className = "",
  label = "Export Data"
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'json' | 'csv') => {
    setIsExporting(true);
    
    try {
      if (format === 'json') {
        // If we have simulation config, prepare a more detailed export
        if (simulationConfig) {
          const exportData = prepareSimulationExport(data, simulationConfig);
          exportAsJson(exportData, 'simulation-results');
        } else {
          exportAsJson(data, 'crowd-data-export');
        }
      } else if (format === 'csv') {
        // For CSV we need an array of objects
        const exportData = Array.isArray(data) ? data : [data];
        exportAsCsv(exportData, 'crowd-data-export');
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      // Could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={className}
          disabled={isExporting}
          aria-label="Export data options"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
