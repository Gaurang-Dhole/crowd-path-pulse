
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Define graph types
interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "entrance" | "exit" | "stage" | "restroom" | "food" | "medical" | "path";
}

interface Edge {
  source: string;
  target: string;
  weight: number; // Distance and crowd density factor
  density: number; // Crowd density (0-1)
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

// Define props
interface PathFinderProps {
  className?: string;
  dimensions?: { width: number; height: number };
}

const PathFinder: React.FC<PathFinderProps> = ({
  className = "",
  dimensions = { width: 600, height: 400 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [path, setPath] = useState<string[]>([]);
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  // Initialize the graph
  useEffect(() => {
    // Create initial venue graph with predefined nodes and edges
    const nodes: Node[] = [
      // Key locations
      { id: "entrance", x: dimensions.width * 0.5, y: dimensions.height * 0.9, label: "Main Entrance", type: "entrance" },
      { id: "exit1", x: dimensions.width * 0.2, y: dimensions.height * 0.9, label: "Exit A", type: "exit" },
      { id: "exit2", x: dimensions.width * 0.8, y: dimensions.height * 0.9, label: "Exit B", type: "exit" },
      { id: "stage", x: dimensions.width * 0.2, y: dimensions.height * 0.2, label: "Main Stage", type: "stage" },
      { id: "food1", x: dimensions.width * 0.7, y: dimensions.height * 0.7, label: "Food Court", type: "food" },
      { id: "food2", x: dimensions.width * 0.3, y: dimensions.height * 0.6, label: "Snack Bar", type: "food" },
      { id: "restroom1", x: dimensions.width * 0.9, y: dimensions.height * 0.3, label: "Restrooms A", type: "restroom" },
      { id: "restroom2", x: dimensions.width * 0.4, y: dimensions.height * 0.4, label: "Restrooms B", type: "restroom" },
      { id: "medical", x: dimensions.width * 0.6, y: dimensions.height * 0.2, label: "Medical Station", type: "medical" },
      
      // Path nodes
      { id: "path1", x: dimensions.width * 0.5, y: dimensions.height * 0.7, label: "Path Junction 1", type: "path" },
      { id: "path2", x: dimensions.width * 0.5, y: dimensions.height * 0.5, label: "Path Junction 2", type: "path" },
      { id: "path3", x: dimensions.width * 0.3, y: dimensions.height * 0.3, label: "Path Junction 3", type: "path" },
      { id: "path4", x: dimensions.width * 0.7, y: dimensions.height * 0.3, label: "Path Junction 4", type: "path" },
      { id: "path5", x: dimensions.width * 0.9, y: dimensions.height * 0.5, label: "Path Junction 5", type: "path" },
      { id: "path6", x: dimensions.width * 0.7, y: dimensions.height * 0.5, label: "Path Junction 6", type: "path" },
    ];

    // Generate edges between nodes
    const edges: Edge[] = [
      // Entrance and exits connections
      { source: "entrance", target: "path1", weight: 1, density: 0.7 },
      { source: "exit1", target: "path1", weight: 1.5, density: 0.4 },
      { source: "exit2", target: "path1", weight: 1.5, density: 0.3 },
      
      // Internal paths
      { source: "path1", target: "path2", weight: 2, density: 0.6 },
      { source: "path2", target: "path3", weight: 2, density: 0.5 },
      { source: "path2", target: "path4", weight: 2, density: 0.3 },
      { source: "path2", target: "path6", weight: 1.5, density: 0.4 },
      { source: "path4", target: "path5", weight: 2, density: 0.2 },
      { source: "path6", target: "path5", weight: 1.5, density: 0.3 },
      
      // Connect to amenities
      { source: "stage", target: "path3", weight: 1, density: 0.9 },
      { source: "food1", target: "path6", weight: 1, density: 0.7 },
      { source: "food2", target: "path3", weight: 1.5, density: 0.5 },
      { source: "restroom1", target: "path5", weight: 1, density: 0.4 },
      { source: "restroom2", target: "path3", weight: 1, density: 0.6 },
      { source: "medical", target: "path4", weight: 1, density: 0.2 },
      
      // Additional paths for more routing options
      { source: "path3", target: "path4", weight: 2.5, density: 0.8 },
      { source: "path1", target: "food2", weight: 3, density: 0.5 },
    ];

    setGraph({ nodes, edges });
    
    // Set default start and end nodes
    setStartNode("entrance");
    setEndNode("stage");
  }, [dimensions]);

  // Implement Dijkstra's algorithm for finding the shortest path
  useEffect(() => {
    if (!startNode || !endNode || !graph.nodes.length) return;

    // Build adjacency list from edges
    const adjacencyList = new Map<string, { node: string; weight: number }[]>();
    
    graph.nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });
    
    graph.edges.forEach(edge => {
      // Adjust weight based on crowd density to prefer less crowded paths
      const adjustedWeight = edge.weight * (1 + edge.density * 2);
      
      const sourceNeighbors = adjacencyList.get(edge.source) || [];
      sourceNeighbors.push({ node: edge.target, weight: adjustedWeight });
      adjacencyList.set(edge.source, sourceNeighbors);
      
      const targetNeighbors = adjacencyList.get(edge.target) || [];
      targetNeighbors.push({ node: edge.source, weight: adjustedWeight });
      adjacencyList.set(edge.target, targetNeighbors);
    });
    
    // Implement Dijkstra's algorithm
    const dijkstra = (start: string, end: string) => {
      // Set distances to all nodes to infinity
      const distances = new Map<string, number>();
      const previousNodes = new Map<string, string | null>();
      const unvisited = new Set<string>();
      
      // Initialize data structures
      graph.nodes.forEach(node => {
        distances.set(node.id, Infinity);
        previousNodes.set(node.id, null);
        unvisited.add(node.id);
      });
      
      // Distance to start node is 0
      distances.set(start, 0);
      
      // Process nodes until all are visited or end is reached
      while (unvisited.size > 0) {
        // Find unvisited node with smallest distance
        let currentNode: string | null = null;
        let smallestDistance = Infinity;
        
        unvisited.forEach(node => {
          const distance = distances.get(node) || Infinity;
          if (distance < smallestDistance) {
            smallestDistance = distance;
            currentNode = node;
          }
        });
        
        // If no accessible node is found or end is reached, break
        if (currentNode === null || currentNode === end || smallestDistance === Infinity) {
          break;
        }
        
        // Remove current node from unvisited
        unvisited.delete(currentNode);
        
        // Update distances to neighbors
        const neighbors = adjacencyList.get(currentNode) || [];
        neighbors.forEach(neighbor => {
          if (unvisited.has(neighbor.node)) {
            const newDistance = (distances.get(currentNode) || 0) + neighbor.weight;
            if (newDistance < (distances.get(neighbor.node) || Infinity)) {
              distances.set(neighbor.node, newDistance);
              previousNodes.set(neighbor.node, currentNode);
            }
          }
        });
      }
      
      // Build the path
      const path: string[] = [];
      let current: string | null = end;
      
      while (current !== null) {
        path.unshift(current);
        current = previousNodes.get(current) || null;
      }
      
      return path.length > 1 ? path : [];
    };
    
    const shortestPath = dijkstra(startNode, endNode);
    setPath(shortestPath);
  }, [graph, startNode, endNode]);

  // Draw the graph and path on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw edges
    graph.edges.forEach(edge => {
      const source = graph.nodes.find(n => n.id === edge.source);
      const target = graph.nodes.find(n => n.id === edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        // Style differently based on crowd density
        const densityColor = `rgba(150, 150, 150, ${0.2 + 0.5 * edge.density})`;
        ctx.strokeStyle = densityColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw density indicator (thicker lines for high density)
        if (edge.density > 0.5) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = "rgba(255, 107, 107, 0.4)";
          ctx.lineWidth = 2 + 4 * edge.density;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw crowds as tiny dots along the path
        const dotsCount = Math.floor(edge.density * 10);
        for (let i = 0; i < dotsCount; i++) {
          const ratio = Math.random();
          const dotX = source.x + (target.x - source.x) * ratio;
          const dotY = source.y + (target.y - source.y) * ratio;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(119, 85, 248, 0.5)";
          ctx.fill();
        }
      }
    });
    
    // Draw the calculated path
    if (path.length > 1) {
      ctx.beginPath();
      
      const firstNode = graph.nodes.find(n => n.id === path[0]);
      if (firstNode) {
        ctx.moveTo(firstNode.x, firstNode.y);
      }
      
      for (let i = 1; i < path.length; i++) {
        const node = graph.nodes.find(n => n.id === path[i]);
        if (node) {
          ctx.lineTo(node.x, node.y);
        }
      }
      
      ctx.strokeStyle = "#7755F8";
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Add path animation
      ctx.beginPath();
      const firstPathNode = graph.nodes.find(n => n.id === path[0]);
      if (firstPathNode) {
        ctx.moveTo(firstPathNode.x, firstPathNode.y);
      }
      
      for (let i = 1; i < path.length; i++) {
        const node = graph.nodes.find(n => n.id === path[i]);
        if (node) {
          ctx.lineTo(node.x, node.y);
        }
      }
      
      ctx.strokeStyle = "rgba(119, 85, 248, 0.5)";
      ctx.lineWidth = 6;
      ctx.setLineDash([4, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw nodes
    graph.nodes.forEach(node => {
      // Draw different shapes/colors based on node type
      ctx.beginPath();
      
      const isNodeInPath = path.includes(node.id);
      const isStart = node.id === startNode;
      const isEnd = node.id === endNode;
      const isHovered = node.id === hoverNode;
      
      // Determine node style based on type and status
      let size = 8;
      let fillColor = "#94a3b8";
      let strokeColor = "#64748b";
      
      if (node.type === "entrance") {
        size = 12;
        fillColor = "#4ade80";
        strokeColor = "#16a34a";
      } else if (node.type === "exit") {
        size = 12;
        fillColor = "#f43f5e";
        strokeColor = "#e11d48";
      } else if (node.type === "stage") {
        size = 14;
        fillColor = "#8b5cf6";
        strokeColor = "#7c3aed";
      } else if (node.type === "restroom") {
        size = 10;
        fillColor = "#60a5fa";
        strokeColor = "#2563eb";
      } else if (node.type === "food") {
        size = 10;
        fillColor = "#fbbf24";
        strokeColor = "#d97706";
      } else if (node.type === "medical") {
        size = 12;
        fillColor = "#f87171";
        strokeColor = "#ef4444";
      }
      
      if (isNodeInPath) {
        size += 2;
        strokeColor = "#7755F8";
      }
      
      if (isStart || isEnd) {
        size += 4;
        strokeColor = isStart ? "#16a34a" : "#e11d48";
        fillColor = isStart ? "#4ade80" : "#f43f5e";
      }
      
      if (isHovered) {
        size += 2;
        ctx.shadowColor = "#7755F8";
        ctx.shadowBlur = 10;
      }
      
      // Draw the node
      if (node.type === "path" && !isNodeInPath && !isHovered) {
        // Simple dot for path junction
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#cbd5e1";
        ctx.fill();
      } else {
        // Draw more prominent nodes
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw labels for main locations (not path nodes)
        if (node.type !== "path" || isHovered) {
          ctx.font = isHovered ? "bold 12px sans-serif" : "12px sans-serif";
          ctx.fillStyle = "#1e293b";
          ctx.textAlign = "center";
          
          // Position label based on node type
          let labelY = node.y + size + 15;
          
          // Draw a background for the label
          const textWidth = ctx.measureText(node.label).width;
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(node.x - textWidth / 2 - 3, labelY - 10, textWidth + 6, 14);
          
          // Draw the text
          ctx.fillStyle = "#1e293b";
          ctx.fillText(node.label, node.x, labelY);
        }
      }
    });
  }, [graph, path, startNode, endNode, hoverNode, dimensions]);
  
  // Handle node selection and mouse interactions
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find if mouse is over a node
    let foundNode: string | null = null;
    for (const node of graph.nodes) {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      const hitSize = node.type === "path" ? 5 : 15; // Larger hit area for main nodes
      
      if (distance <= hitSize) {
        foundNode = node.id;
        break;
      }
    }
    
    // Update the hovered node
    setHoverNode(foundNode);
    
    // Handle drag operation
    if (isDragging && draggedNode) {
      const nodeToUpdate = graph.nodes.findIndex(n => n.id === draggedNode);
      if (nodeToUpdate !== -1) {
        const updatedNodes = [...graph.nodes];
        updatedNodes[nodeToUpdate] = {
          ...updatedNodes[nodeToUpdate],
          x,
          y
        };
        setGraph({
          ...graph,
          nodes: updatedNodes
        });
      }
    }
  };
  
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoverNode) {
      setIsDragging(true);
      setDraggedNode(hoverNode);
    }
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && hoverNode) {
      // If we clicked a node
      if (e.ctrlKey || e.metaKey) {
        // Set as end node
        setEndNode(hoverNode);
      } else if (e.shiftKey) {
        // Set as start node
        setStartNode(hoverNode);
      }
    }
  };

  // Handle node selection from dropdowns
  const handleStartNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStartNode(e.target.value);
  };
  
  const handleEndNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndNode(e.target.value);
  };

  // Get path metrics
  const getPathMetrics = () => {
    if (path.length <= 1) return { distance: 0, crowding: 0, segments: [] };
    
    let totalDistance = 0;
    let totalCrowding = 0;
    const segments: { start: string; end: string; distance: number; density: number }[] = [];
    
    // Calculate the path metrics
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      // Find the edge
      const edge = graph.edges.find(
        e => (e.source === current && e.target === next) ||
             (e.source === next && e.target === current)
      );
      
      if (edge) {
        totalDistance += edge.weight;
        totalCrowding += edge.density;
        
        segments.push({
          start: current,
          end: next,
          distance: edge.weight,
          density: edge.density
        });
      }
    }
    
    return {
      distance: totalDistance,
      crowding: path.length > 1 ? totalCrowding / (path.length - 1) : 0,
      segments
    };
  };
  
  const pathMetrics = getPathMetrics();

  // Get a label for a node
  const getNodeLabel = (nodeId: string) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node ? node.label : nodeId;
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex space-x-4">
        <div className="flex-grow">
          <label className="text-sm font-medium mb-1 block">Start Location</label>
          <select 
            value={startNode || ""} 
            onChange={handleStartNodeChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            {graph.nodes
              .filter(node => node.type !== "path")
              .map(node => (
                <option key={`start-${node.id}`} value={node.id}>
                  {node.label}
                </option>
              ))}
          </select>
        </div>
        <div className="flex-grow">
          <label className="text-sm font-medium mb-1 block">Destination</label>
          <select 
            value={endNode || ""} 
            onChange={handleEndNodeChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            {graph.nodes
              .filter(node => node.type !== "path")
              .map(node => (
                <option key={`end-${node.id}`} value={node.id}>
                  {node.label}
                </option>
              ))}
          </select>
        </div>
      </div>
      
      <div className="relative border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onClick={handleCanvasClick}
          className="cursor-pointer"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm text-xs">
          <p className="text-muted-foreground">Shift+Click: Set Start | Ctrl/Cmd+Click: Set End</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-medium mb-2">Path Details</h3>
        
        {path.length > 1 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="font-medium text-lg">{pathMetrics.distance.toFixed(1)} units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Crowding</p>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: pathMetrics.crowding < 0.3 
                        ? "#4CC38A" 
                        : pathMetrics.crowding < 0.6
                        ? "#FFB347"
                        : "#FF6B6B" 
                    }}
                  ></div>
                  <p className="font-medium text-lg">{(pathMetrics.crowding * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Route</h4>
              <div className="bg-muted p-2 rounded-md text-sm">
                {path.map((nodeId, index) => (
                  <React.Fragment key={`path-${nodeId}`}>
                    <span className="font-medium">{getNodeLabel(nodeId)}</span>
                    {index < path.length - 1 && (
                      <span className="mx-2 text-muted-foreground">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Segment Details</h4>
              <div className="space-y-2">
                {pathMetrics.segments.map((segment, index) => {
                  const densityClass = 
                    segment.density < 0.3 
                      ? "text-density-low" 
                      : segment.density < 0.6
                      ? "text-density-medium"
                      : "text-density-high";
                      
                  return (
                    <div key={`segment-${index}`} className="flex justify-between text-sm border-b pb-1 last:border-0">
                      <span>{getNodeLabel(segment.start)} → {getNodeLabel(segment.end)}</span>
                      <span className={cn("font-medium", densityClass)}>
                        {segment.distance.toFixed(1)} ({(segment.density * 100).toFixed(0)}% crowded)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Select a start and end location to find the optimal path.</p>
        )}
      </div>
    </div>
  );
};

export default PathFinder;
