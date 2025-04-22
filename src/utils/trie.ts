
// Trie implementation for efficient search suggestions
export interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  data?: any;
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      isEndOfWord: false
    };
  }

  // Insert a word into the trie
  insert(word: string, data?: any): void {
    let current = this.root;
    
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, {
          children: new Map(),
          isEndOfWord: false
        });
      }
      current = current.children.get(char)!;
    }
    
    current.isEndOfWord = true;
    if (data) {
      current.data = data;
    }
  }

  // Search for words with the given prefix
  search(prefix: string, limit = 10): Array<{ word: string; data?: any }> {
    const result: Array<{ word: string; data?: any }> = [];
    let current = this.root;
    
    // Navigate to the end of the prefix in the trie
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return result; // Prefix not found
      }
      current = current.children.get(char)!;
    }
    
    // Find all words with the prefix
    this._findAllWords(current, prefix, result, limit);
    
    return result;
  }

  // Helper method to find all words with a given prefix
  private _findAllWords(
    node: TrieNode, 
    prefix: string, 
    result: Array<{ word: string; data?: any }>, 
    limit: number
  ): void {
    if (result.length >= limit) return;
    
    if (node.isEndOfWord) {
      result.push({ word: prefix, data: node.data });
    }
    
    for (const [char, childNode] of node.children.entries()) {
      this._findAllWords(childNode, prefix + char, result, limit);
      if (result.length >= limit) return;
    }
  }
}

// Sample historical reports for search
export const sampleReports = [
  {
    id: "rep-001",
    title: "Main Stage Overcrowding June 2023",
    description: "Analysis of crowd density peaks during headline performance",
    density: 12.4,
    date: "2023-06-15",
    solutions: ["Added barricades", "Staggered entry", "Extra staff deployed"]
  },
  {
    id: "rep-002",
    title: "Food Court Rush Hour Analysis",
    description: "Peak times and crowd flow patterns around dining areas",
    density: 8.2,
    date: "2023-07-22",
    solutions: ["Expanded seating area", "Added additional vendors"]
  },
  {
    id: "rep-003",
    title: "Exit Strategy Optimization",
    description: "Improving evacuation routes and exit capacity",
    density: 6.7,
    date: "2023-08-05",
    solutions: ["Added emergency exit", "Widened main exit paths"]
  },
  {
    id: "rep-004",
    title: "VIP Area Access Control",
    description: "Managing exclusive area access without bottlenecks",
    density: 5.3,
    date: "2023-09-18",
    solutions: ["Separate entry point", "Digital wristband scanning"]
  },
  {
    id: "rep-005",
    title: "Restroom Facility Distribution",
    description: "Optimizing restroom placement and capacity",
    density: 9.1,
    date: "2023-10-07",
    solutions: ["Added portable units", "Improved signage", "Staff directions"]
  },
  {
    id: "rep-006",
    title: "Main Stage Evacuation Test",
    description: "Simulated emergency evacuation from main stage area",
    density: 11.8,
    date: "2023-11-12",
    solutions: ["Revised evacuation protocol", "Additional emergency exits"]
  },
  {
    id: "rep-007",
    title: "Entrance Queue Management",
    description: "Reducing wait times and improving entry flow",
    density: 14.2,
    date: "2023-12-03",
    solutions: ["Added entry lanes", "Improved scanning technology"]
  },
  {
    id: "rep-008",
    title: "Weather Impact Assessment",
    description: "Crowd behavior changes during unexpected rain",
    density: 16.5,
    date: "2024-01-20",
    solutions: ["Covered walkways", "Weather alert system", "Shelter areas"]
  }
];

// Initialize trie with sample reports
export function createReportSearchTrie(): Trie {
  const trie = new Trie();
  
  sampleReports.forEach(report => {
    // Add title words
    report.title.split(" ").forEach(word => {
      if (word.length > 2) trie.insert(word, report);
    });
    
    // Add description words
    report.description.split(" ").forEach(word => {
      if (word.length > 3) trie.insert(word, report);
    });
    
    // Add date
    trie.insert(report.date, report);
  });
  
  return trie;
}
