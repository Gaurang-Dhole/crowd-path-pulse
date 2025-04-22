
import React, { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/ui/logo";
import { motion } from "framer-motion";
import EnhancedVenueMap from "@/components/data-visualization/EnhancedVenueMap";
import PathFinder from "@/components/data-visualization/PathFinder";
import EvacuationPriority from "@/components/data-visualization/EvacuationPriority";
import ReportSearch from "@/components/data-analysis/ReportSearch";
import PredictionPanel from "@/components/data-analysis/PredictionPanel";
import DashboardWidget from "@/components/dashboard/DashboardWidget";
import ExportButton from "@/components/ui/export-button";

// Lazy load the simulation component for better performance
const CrowdSimulation = lazy(() => import("@/components/data-visualization/CrowdSimulation"));

const Index = () => {
  const [activeModule, setActiveModule] = useState<string>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dashboard stats
  const dashboardStats = [
    {
      label: "Current Attendees",
      value: "5,487",
      change: "12% vs. 1 hour ago",
      isPositive: true
    },
    {
      label: "Avg. Density",
      value: "2.8 p/m²",
      change: "5% vs. 1 hour ago",
      isNegative: true
    },
    {
      label: "Hotspots",
      value: "3",
      change: "1 new in last 30 min",
      isNegative: true
    },
    {
      label: "Est. Evacuation Time",
      value: "14:20",
      change: "50 seconds faster with new route",
      isPositive: true
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <Logo />
            <p className="text-sm text-muted-foreground hidden sm:block">Navigate Crowds, Amplify Safety</p>
            <button 
              onClick={toggleSidebar}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content area */}
          <div className={`${isSidebarOpen ? 'md:w-3/4' : 'md:w-full'} transition-all duration-300`}>
            <Tabs defaultValue="overview" value={activeModule} onValueChange={setActiveModule}>
              <div className="mb-6">
                <motion.h1 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Crowd Management and Navigation System
                </motion.h1>
                <motion.p 
                  className="text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Optimize crowd flow, monitor density, and plan safe evacuations with advanced data structures
                </motion.p>
              </div>
              
              <DashboardWidget 
                title="Real-Time Venue Overview"
                statistics={dashboardStats}
                densityLevel="medium"
                densityValue={2.8}
                className="mb-6"
              />
              
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6">
                <TabsTrigger value="overview">Crowd Density</TabsTrigger>
                <TabsTrigger value="pathfinder">Optimal Pathfinding</TabsTrigger>
                <TabsTrigger value="evacuation">Evacuation Priority</TabsTrigger>
                <TabsTrigger value="simulation">Crowd Simulation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border">
                      <h2 className="text-xl font-semibold mb-2">Crowd Density Monitoring</h2>
                      <p className="text-muted-foreground mb-4">
                        Our system uses Quadtrees to efficiently partition and monitor 2D venue space, enabling real-time tracking of crowd density.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">How It Works</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Space is divided into quadrants recursively</li>
                            <li>Each quadrant tracks occupancy in real-time</li>
                            <li>Overcrowded areas trigger automatic alerts</li>
                            <li>O(log n) lookup time for efficient scaling</li>
                          </ul>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">Key Benefits</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Instantly identify high-density areas</li>
                            <li>Prevent dangerous overcrowding</li>
                            <li>Optimize staff positioning</li>
                            <li>Handle venues with 10,000+ attendees</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-primary text-white rounded-lg p-6 border shadow-md">
                      <h2 className="text-xl font-semibold mb-2">About CrowdPathPulse</h2>
                      <p className="mb-4">
                        CrowdPathPulse is a comprehensive crowd management system designed for large events, festivals, and transit hubs. Our platform leverages advanced data structures to ensure attendee safety and optimize the event experience.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/10 rounded-md p-3">
                          <h3 className="font-medium">For Event Organizers</h3>
                          <ul className="mt-1 space-y-1">
                            <li>• Real-time crowd monitoring</li>
                            <li>• Staff optimization</li>
                            <li>• Emergency planning</li>
                            <li>• Venue layout simulation</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white/10 rounded-md p-3">
                          <h3 className="font-medium">For Attendees</h3>
                          <ul className="mt-1 space-y-1">
                            <li>• Optimal navigation</li>
                            <li>• Avoid congested areas</li>
                            <li>• Find nearest facilities</li>
                            <li>• Emergency exit directions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <EnhancedVenueMap 
                      dimensions={{ width: 600, height: 400 }} 
                      pointCount={400}
                      threshold={10}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pathfinder" className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PathFinder 
                      dimensions={{ width: 600, height: 400 }} 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border">
                      <h2 className="text-xl font-semibold mb-2">Optimal Pathfinding</h2>
                      <p className="text-muted-foreground mb-4">
                        Our system uses Graph data structures with Dijkstra's algorithm to find the least congested paths through the venue.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">How It Works</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Graph models venue with locations as vertices</li>
                            <li>Edge weights combine distance and crowd density</li>
                            <li>Dijkstra's algorithm finds optimal paths</li>
                            <li>Path updates as crowd conditions change</li>
                          </ul>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">Applications</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Guide attendees to less crowded exits</li>
                            <li>Direct staff to crowded areas efficiently</li>
                            <li>Find quickest route to amenities</li>
                            <li>Emergency response optimization</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-light to-brand-primary text-white rounded-lg p-4 border shadow-md">
                      <h3 className="font-semibold mb-2">Try It Yourself</h3>
                      <p className="text-sm mb-4">
                        Select different start and end points to see how the system calculates the optimal path based on both distance and crowd density.
                      </p>
                      
                      <div className="text-sm space-y-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                          <span>Use Shift+Click to set a start point</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span>Use Ctrl/Cmd+Click to set a destination</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="evacuation" className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <EvacuationPriority />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border">
                      <h2 className="text-xl font-semibold mb-2">Evacuation Prioritization</h2>
                      <p className="text-muted-foreground mb-4">
                        We use Priority Queues (Heaps) to optimize evacuation order during emergencies, ensuring the most vulnerable attendees are helped first.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">How It Works</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Individuals assigned priority scores</li>
                            <li>Priority Queue orders evacuation sequence</li>
                            <li>O(log n) operations for insertion and removal</li>
                            <li>Dynamic priority updates as conditions change</li>
                          </ul>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">Priority Factors</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Mobility needs (elderly, disabled)</li>
                            <li>Proximity to danger</li>
                            <li>Distance to nearest exit</li>
                            <li>Group size and composition</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent to-density-high text-white rounded-lg p-4 border shadow-md">
                      <h3 className="font-semibold mb-2">Emergency Scenarios</h3>
                      <p className="text-sm mb-4">
                        Set different alert levels to see how the system prioritizes evacuation resources in different scenarios.
                      </p>
                      
                      <div className="text-sm space-y-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span><strong>Drill:</strong> Routine exercise with moderate priority</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                          <span><strong>Warning:</strong> Potential emergency situation</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span><strong>Emergency:</strong> Immediate evacuation required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="simulation" className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Suspense fallback={
                      <div className="w-full h-[400px] flex items-center justify-center bg-muted rounded-lg border">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="mt-2 text-muted-foreground">Loading simulation...</p>
                        </div>
                      </div>
                    }>
                      <CrowdSimulation 
                        dimensions={{ width: 600, height: 400 }} 
                      />
                    </Suspense>
                    <div className="mt-4 flex justify-end">
                      <ExportButton
                        data={{
                          simulationName: "Main Venue Simulation",
                          timestamp: new Date().toISOString(),
                          densityPoints: Array(400).fill(0).map((_, i) => ({
                            id: `sim-point-${i}`,
                            x: Math.random() * 600,
                            y: Math.random() * 400,
                            density: Math.random() * 10 + 1
                          })),
                          evacuationTime: "14:20",
                          bottlenecks: [
                            { id: "b1", location: "Main Exit", severity: 0.8 },
                            { id: "b2", location: "Food Court Passage", severity: 0.6 }
                          ],
                          optimizationSuggestions: [
                            "Add emergency exit near stage",
                            "Widen main entrance corridor",
                            "Add staff at identified bottlenecks"
                          ]
                        }}
                        simulationConfig={{
                          name: "Festival Main Area",
                          attendeeCount: 5000,
                          exits: 3,
                          optimizedLayout: true,
                          timestamp: new Date().toISOString()
                        }}
                        label="Export Simulation Results"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border">
                      <h2 className="text-xl font-semibold mb-2">Crowd Flow Simulation</h2>
                      <p className="text-muted-foreground mb-4">
                        Our system uses Graph data structures to simulate crowd movement and identify bottlenecks to optimize venue layouts and evacuation plans.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">How It Works</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Simulate crowd flow through venue graph</li>
                            <li>Calculate flow rates and identify bottlenecks</li>
                            <li>Test different venue layouts and exit placements</li>
                            <li>Measure evacuation time under different scenarios</li>
                          </ul>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-md">
                          <h3 className="font-medium text-sm">Applications</h3>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>Venue layout optimization</li>
                            <li>Staff placement planning</li>
                            <li>Emergency plan verification</li>
                            <li>Capacity determination</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-dark to-brand-secondary text-white rounded-lg p-4 border shadow-md">
                      <h3 className="font-semibold mb-2">Venue Optimization</h3>
                      <p className="text-sm mb-4">
                        Try different venue layouts to see how exit placement and path width affect evacuation time and crowd flow.
                      </p>
                      
                      <div className="text-sm space-y-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span><strong>Default:</strong> Standard 2-exit configuration</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span><strong>Optimized 1:</strong> Added emergency exit (20% faster)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                          <span><strong>Optimized 2:</strong> 4 exits + wider paths (40% faster)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar - will collapse on mobile */}
          {isSidebarOpen && (
            <motion.div 
              className="md:w-1/4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <ReportSearch className="bg-white p-4 rounded-lg border" />
                <PredictionPanel />
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-brand-primary text-white py-4 mt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo className="text-white" />
              <p className="text-xs mt-2 text-white/70">Navigate Crowds, Amplify Safety</p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm font-medium">A Data Structure-Based Crowd Management System</p>
              <p className="text-xs mt-1 text-white/70">© 2024 CrowdPathPulse. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
