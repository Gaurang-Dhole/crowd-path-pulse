
// Export data utilities

/**
 * Exports data as a JSON file
 * @param data The data to export
 * @param filename The name of the file
 */
export function exportAsJson(data: any, filename: string = 'export'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Creates a simple CSV from an array of objects
 * @param data Array of objects to convert to CSV
 * @param filename The name of the file
 */
export function exportAsCsv(data: any[], filename: string = 'export'): void {
  if (!data.length) return;
  
  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV string
  const csvRows = [];
  
  // Add the headers
  csvRows.push(headers.join(','));
  
  // Add the rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle complex objects or arrays
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Handle strings with commas or quotes
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  // Create blob and download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Helper function to trigger download of a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }, 100);
}

/**
 * Prepare a simulation result summary for export
 */
export function prepareSimulationExport(simulationData: any, config: any): any {
  const timestamp = new Date().toISOString();
  
  return {
    metadata: {
      timestamp,
      name: config.name || "Crowd Simulation",
      description: config.description || "Simulation results"
    },
    config,
    results: simulationData,
    summary: {
      averageDensity: calculateAverageDensity(simulationData),
      peakDensity: calculatePeakDensity(simulationData),
      evacuationTime: simulationData.evacuationTime || "N/A",
      bottlenecks: simulationData.bottlenecks || []
    }
  };
}

// Helper functions for simulation data
function calculateAverageDensity(data: any): number {
  if (!data.densityPoints || !data.densityPoints.length) return 0;
  
  const sum = data.densityPoints.reduce((acc: number, point: any) => acc + point.density, 0);
  return sum / data.densityPoints.length;
}

function calculatePeakDensity(data: any): number {
  if (!data.densityPoints || !data.densityPoints.length) return 0;
  
  return Math.max(...data.densityPoints.map((point: any) => point.density));
}
