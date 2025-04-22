
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Define our evacuation entity type
interface EvacuationEntity {
  id: string;
  label: string;
  priority: number;
  location: string;
  riskFactor: number;
  mobilityNeed: number;
  distanceToExit: number;
  groupSize: number;
  assigned: boolean;
}

interface EvacuationPriorityProps {
  className?: string;
}

const EvacuationPriority: React.FC<EvacuationPriorityProps> = ({ className = "" }) => {
  const [priorityQueue, setPriorityQueue] = useState<EvacuationEntity[]>([]);
  const [assignedResources, setAssignedResources] = useState<EvacuationEntity[]>([]);
  const [totalStaff, setTotalStaff] = useState(12);
  const [assignedStaff, setAssignedStaff] = useState(0);
  const [alertLevel, setAlertLevel] = useState<"none" | "drill" | "warning" | "emergency">("none");

  // Initialize sample data
  useEffect(() => {
    if (alertLevel === "none") {
      setPriorityQueue([]);
      setAssignedResources([]);
      setAssignedStaff(0);
      return;
    }
    
    // Generate sample evacuation entities
    const entities: EvacuationEntity[] = [
      {
        id: "e1",
        label: "Elderly Group",
        priority: 85,
        location: "Main Stage North",
        riskFactor: 0.9,
        mobilityNeed: 0.8,
        distanceToExit: 120,
        groupSize: 5,
        assigned: false
      },
      {
        id: "e2",
        label: "Family with Children",
        priority: 90,
        location: "Food Court",
        riskFactor: 0.7,
        mobilityNeed: 0.5,
        distanceToExit: 80,
        groupSize: 4,
        assigned: false
      },
      {
        id: "e3",
        label: "Person with Disability",
        priority: 95,
        location: "Restrooms A",
        riskFactor: 0.9,
        mobilityNeed: 0.9,
        distanceToExit: 100,
        groupSize: 2,
        assigned: false
      },
      {
        id: "e4",
        label: "VIP Section",
        priority: 60,
        location: "VIP Lounge",
        riskFactor: 0.4,
        mobilityNeed: 0.2,
        distanceToExit: 50,
        groupSize: 15,
        assigned: false
      },
      {
        id: "e5",
        label: "General Attendance",
        priority: 50,
        location: "Main Entrance",
        riskFactor: 0.3,
        mobilityNeed: 0.1,
        distanceToExit: 20,
        groupSize: 50,
        assigned: false
      },
      {
        id: "e6",
        label: "Medical Case",
        priority: 99,
        location: "Medical Station",
        riskFactor: 1.0,
        mobilityNeed: 1.0,
        distanceToExit: 90,
        groupSize: 1,
        assigned: false
      },
      {
        id: "e7",
        label: "Lost Child",
        priority: 92,
        location: "Near Stage",
        riskFactor: 0.8,
        mobilityNeed: 0.7,
        distanceToExit: 110,
        groupSize: 1,
        assigned: false
      },
      {
        id: "e8",
        label: "Staff Members",
        priority: 40,
        location: "Staff Area",
        riskFactor: 0.2,
        mobilityNeed: 0.1,
        distanceToExit: 40,
        groupSize: 8,
        assigned: false
      },
      {
        id: "e9",
        label: "Teen Group",
        priority: 65,
        location: "Snack Bar",
        riskFactor: 0.5,
        mobilityNeed: 0.2,
        distanceToExit: 70,
        groupSize: 6,
        assigned: false
      }
    ];
    
    // Add some randomization based on the alert level
    const adjustedEntities = entities.map(entity => {
      let adjustedPriority = entity.priority;
      
      if (alertLevel === "drill") {
        // Lower priorities for drills
        adjustedPriority = Math.max(20, entity.priority * 0.7);
      } else if (alertLevel === "warning") {
        // Slightly raised priorities for warnings
        adjustedPriority = Math.min(95, entity.priority * 1.1);
      } else if (alertLevel === "emergency") {
        // Much higher priorities for emergencies
        adjustedPriority = Math.min(99, entity.priority * 1.2);
      }
      
      return {
        ...entity,
        priority: Math.round(adjustedPriority)
      };
    });
    
    // Sort by priority (highest first) to simulate priority queue
    const sorted = adjustedEntities.sort((a, b) => b.priority - a.priority);
    setPriorityQueue(sorted);
  }, [alertLevel]);

  // Simulate heap operations for evacuation prioritization
  const assignNextResource = () => {
    if (priorityQueue.length === 0 || assignedStaff >= totalStaff) return;
    
    // Find highest priority unassigned entity
    const nextEntity = priorityQueue[0];
    
    // Remove from queue and add to assigned
    const newQueue = priorityQueue.slice(1);
    const newAssigned = [...assignedResources, { ...nextEntity, assigned: true }];
    
    setPriorityQueue(newQueue);
    setAssignedResources(newAssigned);
    
    // Update staff count
    const staffNeeded = Math.ceil(nextEntity.groupSize * (0.5 + nextEntity.mobilityNeed * 0.5));
    setAssignedStaff(prev => prev + staffNeeded);
  };

  const reassignResource = (entityId: string) => {
    // Find the entity in assigned resources
    const entity = assignedResources.find(e => e.id === entityId);
    if (!entity) return;
    
    // Calculate staff to free
    const staffFreed = Math.ceil(entity.groupSize * (0.5 + entity.mobilityNeed * 0.5));
    
    // Remove from assigned and add back to queue
    const newAssigned = assignedResources.filter(e => e.id !== entityId);
    const newQueue = [...priorityQueue, { ...entity, assigned: false }].sort((a, b) => b.priority - a.priority);
    
    setAssignedResources(newAssigned);
    setPriorityQueue(newQueue);
    setAssignedStaff(prev => prev - staffFreed);
  };

  const completeEvacuation = (entityId: string) => {
    // Find the entity in assigned resources
    const entity = assignedResources.find(e => e.id === entityId);
    if (!entity) return;
    
    // Calculate staff to free
    const staffFreed = Math.ceil(entity.groupSize * (0.5 + entity.mobilityNeed * 0.5));
    
    // Remove from assigned (don't add back to queue)
    const newAssigned = assignedResources.filter(e => e.id !== entityId);
    
    setAssignedResources(newAssigned);
    setAssignedStaff(prev => prev - staffFreed);
  };

  // Get color class based on priority
  const getPriorityColorClass = (priority: number) => {
    if (priority >= 90) return "bg-density-critical text-white";
    if (priority >= 70) return "bg-density-high text-white";
    if (priority >= 50) return "bg-density-medium";
    return "bg-density-low";
  };

  // Get the staff requirement for an entity
  const getStaffRequirement = (entity: EvacuationEntity) => {
    return Math.ceil(entity.groupSize * (0.5 + entity.mobilityNeed * 0.5));
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Evacuation Priority System</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm">Alert Level:</label>
            <select 
              value={alertLevel} 
              onChange={(e) => setAlertLevel(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="none">None</option>
              <option value="drill">Drill</option>
              <option value="warning">Warning</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
        
        {alertLevel === "none" ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active evacuation scenario.</p>
            <p className="text-sm mt-2">Select an alert level to begin evacuation planning.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Staff Resources</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${assignedStaff / totalStaff > 0.8 ? 'bg-density-high' : 'bg-brand-primary'}`}
                      style={{ width: `${Math.min(100, (assignedStaff / totalStaff) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{assignedStaff}/{totalStaff}</span>
                </div>
              </div>
              
              <button
                onClick={assignNextResource}
                disabled={priorityQueue.length === 0 || assignedStaff >= totalStaff}
                className="px-3 py-1 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Next
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority Queue */}
              <div>
                <h4 className="font-medium text-sm mb-2">Priority Queue</h4>
                {priorityQueue.length === 0 ? (
                  <div className="border rounded-md p-4 text-center text-muted-foreground text-sm">
                    Queue is empty
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-3 py-2 text-xs font-medium grid grid-cols-12">
                      <span className="col-span-1">Prio</span>
                      <span className="col-span-4">Group</span>
                      <span className="col-span-3">Location</span>
                      <span className="col-span-2">Size</span>
                      <span className="col-span-2">Staff</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {priorityQueue.map((entity, index) => (
                        <div 
                          key={entity.id}
                          className={`grid grid-cols-12 px-3 py-2 text-sm items-center ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                        >
                          <span className={`col-span-1 font-mono w-8 h-5 flex items-center justify-center rounded text-xs ${getPriorityColorClass(entity.priority)}`}>
                            {entity.priority}
                          </span>
                          <span className="col-span-4 font-medium">{entity.label}</span>
                          <span className="col-span-3 text-muted-foreground text-xs">{entity.location}</span>
                          <span className="col-span-2">{entity.groupSize}</span>
                          <span className="col-span-2">{getStaffRequirement(entity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Assigned Resources */}
              <div>
                <h4 className="font-medium text-sm mb-2">Assigned Resources</h4>
                {assignedResources.length === 0 ? (
                  <div className="border rounded-md p-4 text-center text-muted-foreground text-sm">
                    No resources assigned
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-3 py-2 text-xs font-medium grid grid-cols-12">
                      <span className="col-span-1">Prio</span>
                      <span className="col-span-4">Group</span>
                      <span className="col-span-3">Location</span>
                      <span className="col-span-2">Staff</span>
                      <span className="col-span-2">Actions</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {assignedResources.map((entity, index) => (
                        <div 
                          key={entity.id}
                          className={`grid grid-cols-12 px-3 py-2 text-sm items-center ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                        >
                          <span className={`col-span-1 font-mono w-8 h-5 flex items-center justify-center rounded text-xs ${getPriorityColorClass(entity.priority)}`}>
                            {entity.priority}
                          </span>
                          <span className="col-span-4 font-medium">{entity.label}</span>
                          <span className="col-span-3 text-muted-foreground text-xs">{entity.location}</span>
                          <span className="col-span-2">{getStaffRequirement(entity)}</span>
                          <span className="col-span-2 flex gap-1">
                            <button 
                              onClick={() => reassignResource(entity.id)}
                              className="p-1 text-xs bg-muted hover:bg-muted-foreground/20 rounded"
                              title="Reassign"
                            >
                              ↩️
                            </button>
                            <button 
                              onClick={() => completeEvacuation(entity.id)}
                              className="p-1 text-xs bg-density-low hover:bg-density-low/80 rounded"
                              title="Mark as Evacuated"
                            >
                              ✓
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 border-t pt-3">
              <h4 className="font-medium text-sm mb-2">Priority Factors</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-muted/40 p-2 rounded">
                  <p className="text-xs text-muted-foreground">Mobility Needs</p>
                  <p className="font-medium">+40%</p>
                </div>
                <div className="bg-muted/40 p-2 rounded">
                  <p className="text-xs text-muted-foreground">Distance to Exit</p>
                  <p className="font-medium">+25%</p>
                </div>
                <div className="bg-muted/40 p-2 rounded">
                  <p className="text-xs text-muted-foreground">Risk Factor</p>
                  <p className="font-medium">+35%</p>
                </div>
                <div className="bg-muted/40 p-2 rounded">
                  <p className="text-xs text-muted-foreground">Group Size</p>
                  <p className="font-medium">-10%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvacuationPriority;
