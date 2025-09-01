'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, BarChart3, Menu, X, Settings, User, FolderOpen, Zap, FileText, Activity, Plus, Edit, Trash2, Calendar, Clock, ArrowRight, CheckCircle, Circle, MapPin, Truck, Recycle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  functionalUnit: string;
  createdDate: string;
  lastModified: string;
  status: 'Active' | 'Draft' | 'Completed';
  type: 'Steel' | 'Aluminum' | 'Copper' | 'Other';
}

interface LCAInput {
  id: string;
  label: string;
  type: 'dropdown' | 'text' | 'number';
  options?: string[];
  value: string;
  completed: boolean;
  skipped: boolean;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'input' | 'process' | 'output';
  status: 'empty' | 'filled' | 'skipped';
  connections: string[];
}

// Life Cycle Modeler Component
function LifeCycleModeler({ 
  inputs, 
  setInputs, 
  currentStep, 
  setCurrentStep 
}: { 
  inputs: LCAInput[];
  setInputs: React.Dispatch<React.SetStateAction<LCAInput[]>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {

  // Helper functions for enhanced UI
  const getStepIcon = (stepId: string) => {
    const iconProps = { className: "w-6 h-6 text-purple-400" };
    
    switch (stepId) {
      case 'product': return <FolderOpen {...iconProps} />;
      case 'location': return <MapPin {...iconProps} />;
      case 'energy': return <Zap {...iconProps} />;
      case 'electricity': return <Activity {...iconProps} />;
      case 'scrapRate': return <BarChart3 {...iconProps} />;
      case 'scrapFate': return <Recycle {...iconProps} />;
      case 'water': return <div {...iconProps}>💧</div>;
      case 'materialSource': return <MapPin {...iconProps} />;
      case 'transportation': return <Truck {...iconProps} />;
      case 'endOfLife': return <Recycle {...iconProps} />;
      default: return <Circle {...iconProps} />;
    }
  };

  const getStepDescription = (stepId: string) => {
    switch (stepId) {
      case 'product': return 'Choose the product you want to analyze from your existing projects. This will determine the functional unit for your analysis.';
      case 'location': return 'Select the geographic location of your manufacturing facility. This affects energy mix and transportation calculations.';
      case 'energy': return 'Specify the primary energy source used in your manufacturing process. This significantly impacts carbon footprint.';
      case 'electricity': return 'Enter the electricity consumption per functional unit of product. This helps calculate energy-related emissions.';
      case 'scrapRate': return 'Specify the percentage of material that becomes scrap during the manufacturing process.';
      case 'scrapFate': return 'Indicate what happens to the scrap material generated during production. This affects waste calculations.';
      case 'water': return 'Enter the water consumption per functional unit. Water usage is an important environmental indicator.';
      case 'materialSource': return 'Select the location where raw materials are sourced from. Distance affects transportation impact.';
      case 'transportation': return 'Choose the primary mode of transportation for raw materials. Different modes have varying environmental impacts.';
      case 'endOfLife': return 'Specify what happens to the product at the end of its useful life. This completes the lifecycle analysis.';
      default: return 'Please provide the required information for this step.';
    }
  };

  const getPlaceholder = (stepId: string) => {
    switch (stepId) {
      case 'electricity': return 'e.g., 150';
      case 'scrapRate': return 'e.g., 5';
      case 'water': return 'e.g., 200';
      default: return `Enter ${stepId}...`;
    }
  };

  const getUnit = (stepId: string) => {
    switch (stepId) {
      case 'electricity': return 'kWh/unit';
      case 'scrapRate': return '%';
      case 'water': return 'L/unit';
      default: return '';
    }
  };

  const handleInputChange = (value: string) => {
    const updatedInputs = [...inputs];
    updatedInputs[currentStep] = {
      ...updatedInputs[currentStep],
      value,
      // Don't mark as completed until user clicks Next
      completed: false,
      skipped: false
    };
    setInputs(updatedInputs);
  };

  const handleNext = () => {
    // Mark current input as completed only when Next is clicked
    const updatedInputs = [...inputs];
    if (updatedInputs[currentStep].value.trim() !== '') {
      updatedInputs[currentStep] = {
        ...updatedInputs[currentStep],
        completed: true,
        skipped: false
      };
      setInputs(updatedInputs);
    }
    
    if (currentStep < inputs.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    const updatedInputs = [...inputs];
    updatedInputs[currentStep] = {
      ...updatedInputs[currentStep],
      skipped: true,
      completed: false,
      value: ''
    };
    setInputs(updatedInputs);
    if (currentStep < inputs.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentInput = inputs[currentStep];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header Section */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Life Cycle Modeler</h2>
            <p className="text-gray-400 text-sm">Configure your LCA parameters</p>
          </div>
        </div>
      </div>

      {/* Professional Input Card */}
      <div className="flex-1 relative">
        <div className="h-full bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20"></div>
          </div>

          <div className="relative z-10 h-full p-4 flex flex-col">
            
            {/* Header with Title & Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{currentInput.label}</h3>
                    <div className="text-xs text-gray-400">Step {currentStep + 1} of {inputs.length}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-400">
                    {Math.round(((inputs.filter(i => i.completed).length) / inputs.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Complete</div>
                </div>
              </div>
              
              {/* Step Description */}
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-lg p-2 border border-gray-600/20">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(currentInput.id)}
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {getStepDescription(currentInput.id)}
                  </p>
                </div>
              </div>
            </div>

            {/* Your Input Section */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-200 mb-2 uppercase tracking-wide">
                Your Input
              </label>
              
              {currentInput.type === 'dropdown' && (
                <div className="relative">
                  <select
                    value={currentInput.value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-2 border-gray-600/40 focus:border-purple-500/60 hover:border-purple-400/40 rounded-lg px-3 py-2.5 text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm"
                  >
                    <option value="" className="bg-gray-800">Choose an option...</option>
                    {currentInput.options?.map((option, index) => (
                      <option key={index} value={option} className="bg-gray-800">{option}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {(currentInput.type === 'text' || currentInput.type === 'number') && (
                <div className="relative">
                  <input
                    type={currentInput.type}
                    value={currentInput.value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-2 border-gray-600/40 focus:border-purple-500/60 hover:border-purple-400/40 rounded-lg px-3 py-2.5 text-white focus:outline-none transition-all duration-300 placeholder-gray-400 text-sm"
                    placeholder={getPlaceholder(currentInput.id)}
                  />
                  {currentInput.type === 'number' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 text-xs font-medium bg-purple-500/10 px-2 py-1 rounded">
                      {getUnit(currentInput.id)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Status & Tips */}
            <div className="mb-3">
              {currentInput.value ? (
                <div className="flex items-center space-x-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  </div>
                  <div>
                    <div className="text-green-400 text-xs font-medium">Input Received</div>
                    <div className="text-green-300/80 text-xs">Ready to proceed</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-blue-400 text-xs font-medium">Awaiting Input</div>
                    <div className="text-blue-300/80 text-xs">Enter data above</div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Progress Section */}
            <div className="mb-4 flex-1">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-200">Overall Progress</span>
                  </div>
                  <div className="text-xs text-purple-400 font-semibold">
                    {inputs.filter(i => i.completed).length} / {inputs.length}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-700/60 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 relative"
                      style={{ width: `${(inputs.filter(i => i.completed).length / inputs.length) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Progress milestones */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span className={inputs.filter(i => i.completed).length >= 1 ? 'text-purple-400' : ''}>
                      Started
                    </span>
                    <span className={inputs.filter(i => i.completed).length >= inputs.length / 2 ? 'text-purple-400' : ''}>
                      Halfway
                    </span>
                    <span className={inputs.filter(i => i.completed).length === inputs.length ? 'text-purple-400' : ''}>
                      Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons - Fixed at bottom */}
            <div className="flex items-center justify-between space-x-2 flex-shrink-0">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-700/80 to-gray-600/80 hover:from-gray-600/80 hover:to-gray-500/80 disabled:from-gray-800/50 disabled:to-gray-800/50 disabled:text-gray-500 text-white rounded-lg transition-all duration-300 disabled:cursor-not-allowed border border-gray-500/30 hover:border-gray-400/50 disabled:border-gray-700/30 text-sm"
              >
                <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Previous</span>
              </button>
              
              <button
                onClick={handleSkip}
                className="group flex items-center space-x-2 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 rounded-lg transition-all duration-300 font-medium text-sm"
              >
                <Circle className="w-3 h-3" />
                <span>Skip</span>
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentStep === inputs.length - 1}
                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-400 text-white rounded-lg transition-all duration-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 disabled:hover:scale-100 text-sm"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Obsidian-style Graph Component with Pan & Zoom
function ObsidianGraph({ inputs, currentStep }: { inputs: LCAInput[], currentStep: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.2 });
  const [targetTransform, setTargetTransform] = useState({ x: 0, y: 0, scale: 1.2 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(0);
  const [userPreferredZoom, setUserPreferredZoom] = useState(1.2);
  const [momentum, setMomentum] = useState({ x: 0, y: 0 });
  // Auto-focus state for new nodes (using setter only)
  const [, setAutoFocusEnabled] = useState(true);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  // Generate nodes dynamically based on input progress
  const generateNodes = useCallback((): GraphNode[] => {
    const nodes: GraphNode[] = [];
    const completedInputs = inputs.filter(input => input.completed);
    
    // More dynamic and impressive positioning
    const centerX = 500;
    const centerY = 300;
    const radius = 180;
    
    // Always show current step node (even if not completed)
    const nodesToShow = Math.max(completedInputs.length, currentStep >= 0 ? currentStep + 1 : 0);
    
    for (let i = 0; i < Math.min(nodesToShow, inputs.length); i++) {
      const input = inputs[i];
      
      // Create an organic spiral layout for visual appeal
      const angle = (i / inputs.length) * Math.PI * 2 - Math.PI / 2; // Start from top
      const spiralRadius = radius + Math.sin(i * 0.8) * 40; // Organic variation
      const x = centerX + Math.cos(angle) * spiralRadius + Math.sin(i * 1.2) * 20;
      const y = centerY + Math.sin(angle) * spiralRadius + Math.cos(i * 0.7) * 15;
      
      nodes.push({
        id: input.id,
        x: x,
        y: y,
        label: input.label,
        type: i === 0 ? 'input' : i === inputs.length - 1 ? 'output' : 'process',
        status: input.completed ? 'filled' : input.skipped ? 'skipped' : 'empty',
        connections: i < Math.min(nodesToShow - 1, inputs.length - 1) ? [inputs[i + 1].id] : []
      });
    }

    return nodes;
  }, [inputs, currentStep]);

  const [nodes, setNodes] = useState<GraphNode[]>([]);

  // Enhanced zoom functions with bounds checking
  const zoomIn = () => {
    setAutoFocusEnabled(false); // Disable auto-focus when user manually zooms
    const newScale = Math.min(3, targetTransform.scale * 1.2);
    setTargetTransform(prev => ({ ...prev, scale: newScale }));
    setUserPreferredZoom(newScale);
  };

  const zoomOut = () => {
    setAutoFocusEnabled(false); // Disable auto-focus when user manually zooms
    const newScale = Math.max(0.3, targetTransform.scale * 0.8);
    setTargetTransform(prev => ({ ...prev, scale: newScale }));
    setUserPreferredZoom(newScale);
  };

  // Smooth camera focus function
  const focusOnNode = useCallback((nodeX: number, nodeY: number, targetScale?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Use user's preferred zoom if no specific scale is provided
    const finalScale = targetScale || userPreferredZoom;
    
    // Calculate the transform needed to center the node
    const targetX = centerX - nodeX * finalScale;
    const targetY = centerY - nodeY * finalScale;
    
    setTargetTransform({
      x: targetX,
      y: targetY,
      scale: finalScale
    });
  }, [userPreferredZoom]);

  // Update nodes when inputs or currentStep changes
  useEffect(() => {
    const newNodes = generateNodes();
    
    // Preserve existing node positions when updating
    setNodes(prevNodes => {
      const previousNodeCount = prevNodes.length;
      const updatedNodes = newNodes.map((newNode: GraphNode) => {
        const existingNode = prevNodes.find(n => n.id === newNode.id);
        if (existingNode) {
          // Keep the existing position if the node already exists
          return { ...newNode, x: existingNode.x, y: existingNode.y };
        }
        return newNode;
      });
      
      // Auto-enable focus and focus on new node when a new node is added
      if (updatedNodes.length > previousNodeCount && updatedNodes.length > 0 && currentStep >= 0 && currentStep < updatedNodes.length) {
        setAutoFocusEnabled(true); // Enable auto-focus for new nodes
        const currentNode = updatedNodes[currentStep];
        if (currentNode) {
          setTimeout(() => {
            // Always focus on new node, maintaining current zoom level or using preferred zoom
            const focusZoom = Math.max(userPreferredZoom, targetTransform.scale);
            focusOnNode(currentNode.x, currentNode.y, focusZoom);
          }, 100); // Small delay to ensure node is rendered
        }
      }
      
      return updatedNodes;
    });
  }, [inputs, currentStep, userPreferredZoom, generateNodes, focusOnNode, targetTransform.scale]);

  // Keyboard event handler for zoom shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetView();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Smooth transform animation with optimization
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    
    const animateTransform = (currentTime: number) => {
      // Throttle to 60fps max
      if (currentTime - lastTime < 16.67) {
        animationId = requestAnimationFrame(animateTransform);
        return;
      }
      lastTime = currentTime;
      
      setTransform(current => {
        const deltaX = targetTransform.x - current.x;
        const deltaY = targetTransform.y - current.y;
        const deltaScale = targetTransform.scale - current.scale;
        
        // Smooth easing factor - faster for better responsiveness
        const easing = 0.15;
        
        // Check if we're close enough to stop animating
        if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1 && Math.abs(deltaScale) < 0.005) {
          return targetTransform;
        }
        
        return {
          x: current.x + deltaX * easing,
          y: current.y + deltaY * easing,
          scale: current.scale + deltaScale * easing
        };
      });
      
      animationId = requestAnimationFrame(animateTransform);
    };
    
    animationId = requestAnimationFrame(animateTransform);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [targetTransform]);

  // Continuous animation loop for impressive effects
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      // Force redraw for animations
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Trigger redraw by updating a dummy state if needed
          // The draw function will handle the animation timing
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Get touch distance for pinch gestures
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Handle mouse events for panning and node dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = (screenX - transform.x) / transform.scale;
    const worldY = (screenY - transform.y) / transform.scale;

    // Check if clicking on a node
    const hitRadius = Math.max(20, 30 / transform.scale);
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((worldX - node.x) ** 2 + (worldY - node.y) ** 2);
      return distance <= hitRadius;
    });

    if (clickedNode) {
      // Start dragging the node
      setDraggedNode(clickedNode);
      setDragOffset({
        x: worldX - clickedNode.x,
        y: worldY - clickedNode.y
      });
      setAutoFocusEnabled(false); // Disable auto-focus when dragging nodes
    } else {
      // Start panning
      setIsDragging(true);
      setAutoFocusEnabled(false); // Disable auto-focus when user manually pans
    }
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (draggedNode) {
      // Dragging a node
      const worldX = (screenX - transform.x) / transform.scale;
      const worldY = (screenY - transform.y) / transform.scale;
      
      // Update the dragged node's position
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === draggedNode.id 
            ? { ...node, x: worldX - dragOffset!.x, y: worldY - dragOffset!.y }
            : node
        )
      );
    } else if (isDragging) {
      // Panning the canvas
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      // Store momentum for smooth release
      setMomentum({ x: deltaX * 0.3, y: deltaY * 0.3 });
      
      setTargetTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isDragging && (Math.abs(momentum.x) > 1 || Math.abs(momentum.y) > 1)) {
      // Apply momentum when releasing pan
      setTargetTransform(prev => ({
        ...prev,
        x: prev.x + momentum.x * 3,
        y: prev.y + momentum.y * 3
      }));
    }
    
    setIsDragging(false);
    setDraggedNode(null);
    setMomentum({ x: 0, y: 0 });
  };

  // Handle wheel zoom with damping
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setAutoFocusEnabled(false); // Disable auto-focus when user manually zooms
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalized zoom with damping for different devices
    const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100) / 100;
    const scaleFactor = delta > 0 ? 0.85 : 1.15;
    const newScale = Math.max(0.3, Math.min(3, targetTransform.scale * scaleFactor));
    
    // Zoom towards mouse position with precise calculation
    const worldMouseX = (mouseX - targetTransform.x) / targetTransform.scale;
    const worldMouseY = (mouseY - targetTransform.y) / targetTransform.scale;
    
    const newX = mouseX - worldMouseX * newScale;
    const newY = mouseY - worldMouseY * newScale;
    
    setTargetTransform({
      x: newX,
      y: newY,
      scale: newScale
    });
    
    // Save user's preferred zoom level
    setUserPreferredZoom(newScale);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setAutoFocusEnabled(false); // Disable auto-focus when user touches
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = touch.clientX - rect.left;
      const screenY = touch.clientY - rect.top;
      const worldX = (screenX - transform.x) / transform.scale;
      const worldY = (screenY - transform.y) / transform.scale;

      // Check if touch is on a node
      const hitRadius = Math.max(20, 40 / transform.scale); // Larger hit area for touch
      const touchedNode = nodes.find(node => {
        const distance = Math.sqrt((worldX - node.x) ** 2 + (worldY - node.y) ** 2);
        return distance <= hitRadius;
      });

      if (touchedNode) {
        // Start dragging node
        setDraggedNode(touchedNode);
        setDragOffset({ x: worldX - touchedNode.x, y: worldY - touchedNode.y });
        setAutoFocusEnabled(false); // Disable auto-focus when dragging nodes
      } else {
        // Start panning canvas
        setIsDragging(true);
        setLastMousePos({ x: touch.clientX, y: touch.clientY });
      }
    } else if (e.touches.length === 2) {
      setTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = touch.clientX - rect.left;
      const screenY = touch.clientY - rect.top;

      if (draggedNode && dragOffset) {
        // Update node position
        const worldX = (screenX - transform.x) / transform.scale;
        const worldY = (screenY - transform.y) / transform.scale;
        
        setNodes(prev => prev.map(node =>
          node.id === draggedNode.id
            ? { ...node, x: worldX - dragOffset!.x, y: worldY - dragOffset!.y }
            : node
        ));
      } else if (isDragging) {
        // Single finger pan
        const deltaX = touch.clientX - lastMousePos.x;
        const deltaY = touch.clientY - lastMousePos.y;
        
        setTargetTransform(prev => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setLastMousePos({ x: touch.clientX, y: touch.clientY });
      }
    } else if (e.touches.length === 2) {
      // Two finger pinch zoom - zoom towards center of touches
      const newDistance = getTouchDistance(e.touches);
      if (touchDistance > 0) {
        const scaleFactor = newDistance / touchDistance;
        const newScale = Math.max(0.3, Math.min(3, targetTransform.scale * scaleFactor));
        
        // Calculate center point between two fingers
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
          const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
          
          // Zoom towards the center of the pinch
          const worldX = (centerX - targetTransform.x) / targetTransform.scale;
          const worldY = (centerY - targetTransform.y) / targetTransform.scale;
          const newX = centerX - worldX * newScale;
          const newY = centerY - worldY * newScale;
          
          setTargetTransform({
            x: newX,
            y: newY,
            scale: newScale
          });
        } else {
          setTargetTransform(prev => ({
            ...prev,
            scale: newScale
          }));
        }
        
        // Save user's preferred zoom level
        setUserPreferredZoom(newScale);
      }
      setTouchDistance(newDistance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDraggedNode(null);
    setDragOffset(null);
    setTouchDistance(0);
  };

  // Reset view function - shows full graph overview
  const resetView = () => {
    // Calculate bounds of all nodes
    if (nodes.length === 0) {
      setTargetTransform({ x: 0, y: 0, scale: 1 });
      setUserPreferredZoom(1);
      return;
    }

    const padding = 100;
    const minX = Math.min(...nodes.map(n => n.x)) - padding;
    const maxX = Math.max(...nodes.map(n => n.x)) + padding;
    const minY = Math.min(...nodes.map(n => n.y)) - padding;
    const maxY = Math.max(...nodes.map(n => n.y)) + padding;

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const canvas = canvasRef.current;
    
    if (canvas) {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate scale to fit all nodes with padding
      const scaleX = canvasWidth / graphWidth;
      const scaleY = canvasHeight / graphHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 1x
      
      // Center the graph
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const x = canvasWidth / 2 - centerX * scale;
      const y = canvasHeight / 2 - centerY * scale;
      
      setTargetTransform({ x, y, scale });
      setUserPreferredZoom(scale);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with proper scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas with impressive dark background
    ctx.fillStyle = 'rgba(17, 24, 39, 0.98)';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Add subtle grid pattern
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.08)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.globalAlpha = 0.05 + Math.sin(time + x * 0.01) * 0.03;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.globalAlpha = 0.05 + Math.cos(time + y * 0.01) * 0.03;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
    ctx.restore();
    
    // Ambient center glow
    const centerGlow = ctx.createRadialGradient(
      rect.width / 2, rect.height / 2, 0,
      rect.width / 2, rect.height / 2, 600
    );
    centerGlow.addColorStop(0, 'rgba(168, 85, 247, 0.03)');
    centerGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.01)');
    centerGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add floating ambient particles
    for (let i = 0; i < 15; i++) {
      const x = (Math.sin(time * 0.3 + i * 0.8) * 200 + rect.width / 2);
      const y = (Math.cos(time * 0.4 + i * 1.2) * 150 + rect.height / 2);
      const size = 1 + Math.sin(time * 2 + i) * 0.5;
      const alpha = 0.1 + Math.sin(time * 1.5 + i * 0.5) * 0.05;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#A855F7';
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    // Save context for transformations
    ctx.save();

    // Apply transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // Draw linear connections with dynamic effects
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const targetNode = nodes.find(n => n.id === connectionId);
        if (targetNode) {
          const isActive = node.status === 'filled' || targetNode.status === 'filled';
          
          // Create impressive gradient for linear connections
          const gradient = ctx.createLinearGradient(node.x, node.y, targetNode.x, targetNode.y);
          
          if (isActive) {
            // Vibrant gradient for active connections
            gradient.addColorStop(0, '#8B5CF6');
            gradient.addColorStop(0.3, '#A855F7');
            gradient.addColorStop(0.7, '#C084FC');
            gradient.addColorStop(1, '#DDD6FE');
            ctx.lineWidth = 3;
            ctx.shadowColor = '#A855F7';
            ctx.shadowBlur = 8;
          } else {
            // Subtle gradient for inactive connections
            gradient.addColorStop(0, '#64748B');
            gradient.addColorStop(0.5, '#475569');
            gradient.addColorStop(1, '#334155');
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
          }
          
          // Draw the linear path
          ctx.strokeStyle = gradient;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
          
          // Add flowing particles for active connections
          if (isActive) {
            const time = Date.now() * 0.001;
            for (let i = 0; i < 2; i++) {
              const progress = ((time * 0.8 + i * 0.5) % 1);
              
              // Calculate particle position along linear path
              const t = progress;
              const x = node.x + (targetNode.x - node.x) * t;
              const y = node.y + (targetNode.y - node.y) * t;
              
              // Draw glowing particle
              ctx.save();
              ctx.globalAlpha = 0.8 * (1 - progress);
              ctx.fillStyle = '#DDD6FE';
              ctx.shadowColor = '#A855F7';
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, 2 * Math.PI);
              ctx.fill();
              ctx.restore();
            }
          }
        }
      });
    });

    // Draw impressive nodes with dynamic effects
    nodes.forEach(node => {
      const baseSize = selectedNode?.id === node.id ? 20 : 16;
      const time = Date.now() * 0.001;
      
      // Dynamic pulsing for filled nodes
      const pulseScale = node.status === 'filled' ? 1 + Math.sin(time * 3) * 0.1 : 1;
      const nodeSize = baseSize * pulseScale;
      
      ctx.save();
      
      // Impressive glow effect for active nodes
      if (node.status === 'filled') {
        ctx.shadowColor = '#A855F7';
        ctx.shadowBlur = 20;
        
        // Multiple glow layers for depth
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize + i * 8, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(168, 85, 247, ${0.1 - i * 0.03})`;
          ctx.fill();
        }
      }
      
      // Main node with gradient
      const gradient = ctx.createRadialGradient(
        node.x - nodeSize * 0.3, 
        node.y - nodeSize * 0.3, 
        0,
        node.x, 
        node.y, 
        nodeSize
      );
      
      if (node.status === 'filled') {
        gradient.addColorStop(0, '#DDD6FE');
        gradient.addColorStop(0.4, '#C084FC');
        gradient.addColorStop(0.8, '#A855F7');
        gradient.addColorStop(1, '#7C3AED');
      } else if (node.status === 'skipped') {
        gradient.addColorStop(0, '#FDE047');
        gradient.addColorStop(0.5, '#EAB308');
        gradient.addColorStop(1, '#CA8A04');
      } else {
        gradient.addColorStop(0, '#94A3B8');
        gradient.addColorStop(0.5, '#64748B');
        gradient.addColorStop(1, '#475569');
      }
      
      // Draw main circle
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
      ctx.fill();
      
      // Elegant border
      ctx.strokeStyle = node.status === 'filled' ? '#7C3AED' : 
                       node.status === 'skipped' ? '#CA8A04' : '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Inner highlight for depth
      ctx.strokeStyle = node.status === 'filled' ? '#DDD6FE' : '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize - 3, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Status indicator
      if (node.status === 'filled') {
        // Glowing center dot
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#DDD6FE';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      } else if (node.status === 'skipped') {
        // Warning icon
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', node.x, node.y);
      }
      
      ctx.restore();
      
      // Enhanced label with background
      const labelY = node.y + nodeSize + 16;
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
      const labelWidth = ctx.measureText(node.label).width;
      
      // Label background with rounded corners
      const padding = 8;
      const bgWidth = labelWidth + padding * 2;
      const bgHeight = 20;
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(node.x - bgWidth/2, labelY - bgHeight/2, bgWidth, bgHeight, 6);
      ctx.fill();
      
      // Label border
      ctx.strokeStyle = node.status === 'filled' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Label text
      ctx.fillStyle = node.status === 'filled' ? '#DDD6FE' : '#E2E8F0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, labelY);

      // Selection indicator with enhanced visibility (scales with zoom)
      if (selectedNode?.id === node.id) {
        const outlineScale = 1 / transform.scale; // Scale outline to maintain consistent thickness
        
        // Outer glow
        ctx.shadowColor = '#A855F7';
        ctx.shadowBlur = 15 * outlineScale;
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 4 * outlineScale;
        ctx.setLineDash([10 * outlineScale, 5 * outlineScale]);
        ctx.lineDashOffset = 0; // Static dotted pattern, no rotation
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize + 12 * outlineScale, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Inner solid ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#DDD6FE';
        ctx.lineWidth = 2 * outlineScale;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize + 6 * outlineScale, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Reset
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }
    });

    // Restore context
    ctx.restore();

  }, [transform, nodes, selectedNode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Convert screen coordinates to world coordinates
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldX = (screenX - transform.x) / transform.scale;
    const worldY = (screenY - transform.y) / transform.scale;

    // Check if click is on a node (use dynamic hit area based on zoom)
    const hitRadius = Math.max(20, 30 / transform.scale); // Larger hit area when zoomed out
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((worldX - node.x) ** 2 + (worldY - node.y) ** 2);
      return distance <= hitRadius;
    });

    // Always set the selected node, regardless of drag state
    setSelectedNode(clickedNode || null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <h2 className="text-xl font-bold mb-1">Process Flow Visualization</h2>
        <p className="text-gray-400 text-sm">Interactive LCA process mapping - Drag to pan, scroll to zoom, Ctrl+/- to zoom, Ctrl+0 to reset. Purple button focuses current step.</p>
      </div>

      {/* Graph Canvas Container */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-700/30 rounded-xl overflow-hidden">
        
        {/* Control Panel */}
        <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
          <button
            onClick={zoomIn}
            className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 rounded-lg flex items-center justify-center text-white transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={zoomOut}
            className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 rounded-lg flex items-center justify-center text-white transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 rounded-lg flex items-center justify-center text-white transition-colors"
            title="Reset View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Focus current step */}
          <button
            onClick={() => {
              if (nodes.length > 0 && currentStep >= 0 && currentStep < nodes.length) {
                const currentNode = nodes[currentStep];
                if (currentNode) {
                  focusOnNode(currentNode.x, currentNode.y, userPreferredZoom);
                }
              }
            }}
            className="w-8 h-8 bg-purple-600/80 hover:bg-purple-500/80 border border-purple-500/50 rounded-lg flex items-center justify-center text-white transition-colors"
            title="Focus Current Step"
            disabled={nodes.length === 0 || currentStep < 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Node Information Overlay - Bottom Right Position */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="absolute bottom-4 right-4 z-20 bg-gray-900/70 backdrop-blur-md border border-gray-600/50 rounded-lg p-3 shadow-lg max-w-xs pointer-events-auto"
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-1 right-1 w-5 h-5 bg-gray-700/60 hover:bg-gray-600/80 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Compact Node Details */}
            <div className="pr-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedNode.status === 'filled' ? 'bg-purple-500/80' :
                  selectedNode.status === 'skipped' ? 'bg-yellow-500/80' :
                  'bg-gray-600/80'
                }`}>
                  {selectedNode.status === 'filled' ? (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : selectedNode.status === 'skipped' ? (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedNode.label}</h3>
                  <div className="text-xs text-gray-300">
                    {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
                  </div>
                </div>
              </div>

              {/* Compact Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Status:</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  selectedNode.status === 'filled' ? 'bg-green-500/30 text-green-300' :
                  selectedNode.status === 'skipped' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-gray-500/30 text-gray-300'
                }`}>
                  {selectedNode.status === 'filled' ? 'Completed' :
                   selectedNode.status === 'skipped' ? 'Skipped' :
                   'Pending'}
                </span>
              </div>

              {/* Compact Status Message */}
              <div className="text-xs mb-2">
                {selectedNode.status === 'filled' && (
                  <div className="text-green-300/80">✓ Data collected successfully</div>
                )}
                {selectedNode.status === 'skipped' && (
                  <div className="text-yellow-300/80">⚠ Step was skipped</div>
                )}
                {selectedNode.status === 'empty' && (
                  <div className="text-gray-300/80">⏳ Awaiting completion</div>
                )}
              </div>

              {/* Compact Connections */}
              {selectedNode.connections.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-400 mb-1">Connected to:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.connections.slice(0, 2).map(connectionId => {
                      const connectedNode = nodes.find(n => n.id === connectionId);
                      return connectedNode ? (
                        <span
                          key={connectionId}
                          className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30"
                        >
                          {connectedNode.label.split(' ')[0]}
                        </span>
                      ) : null;
                    })}
                    {selectedNode.connections.length > 2 && (
                      <span className="text-xs text-gray-400">+{selectedNode.connections.length - 2} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Compact Action Button */}
              <div className="pt-1">
                {selectedNode.status === 'empty' && (
                  <button className="w-full bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors">
                    Complete
                  </button>
                )}
                {selectedNode.status === 'filled' && (
                  <button className="w-full bg-gray-600/80 hover:bg-gray-600 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors">
                    Edit
                  </button>
                )}
                {selectedNode.status === 'skipped' && (
                  <button className="w-full bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors">
                    Provide Data
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-3 left-3 text-xs text-gray-400 bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm">
          Drag to pan • Scroll to zoom • Touch: pinch to zoom • Click nodes for details
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleCanvasClick}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-gray-600/20 rounded-lg p-3">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Skipped</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Steel Production Analysis',
      description: 'LCA analysis for steel manufacturing process optimization',
      functionalUnit: '1 ton',
      createdDate: '2025-08-15',
      lastModified: '2025-08-30',
      status: 'Active',
      type: 'Steel'
    },
    {
      id: '2',
      name: 'Aluminum Recycling Study',
      description: 'Environmental impact assessment of aluminum recycling',
      functionalUnit: '500 kg',
      createdDate: '2025-08-20',
      lastModified: '2025-08-28',
      status: 'Draft',
      type: 'Aluminum'
    },
    {
      id: '3',
      name: 'Copper Wire Manufacturing',
      description: 'Complete LCA for copper wire production facility',
      functionalUnit: '100 kg',
      createdDate: '2025-07-10',
      lastModified: '2025-08-25',
      status: 'Completed',
      type: 'Copper'
    }
  ]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    functionalUnit: '',
    type: 'Steel' as Project['type']
  });

  // LCA Modeler State
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<LCAInput[]>([
    {
      id: 'product',
      label: 'Product Selection',
      type: 'dropdown',
      options: projects.map(p => `${p.name} (${p.functionalUnit})`),
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'location',
      label: 'Factory Location',
      type: 'dropdown',
      options: ['India - Mumbai', 'India - Delhi', 'India - Chennai', 'India - Kolkata', 'India - Bangalore', 'China - Shanghai', 'USA - California', 'Germany - Berlin'],
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'energy',
      label: 'Energy Source',
      type: 'dropdown',
      options: ['Coal', 'Natural Gas', 'Solar', 'Wind', 'Hydroelectric', 'Nuclear', 'Mixed Grid'],
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'electricity',
      label: 'Electricity Consumption (kWh/unit)',
      type: 'number',
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'scrapRate',
      label: 'Process Scrap Rate (%)',
      type: 'number',
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'scrapFate',
      label: 'Scrap Fate',
      type: 'dropdown',
      options: ['Recycled Internally', 'Sold to Recycler', 'Sent to Landfill', 'Incinerated'],
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'waterUsage',
      label: 'Water Usage (L/unit)',
      type: 'number',
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'transport',
      label: 'Transportation Mode',
      type: 'dropdown',
      options: ['Truck', 'Rail', 'Ship', 'Air', 'Combined'],
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'packaging',
      label: 'Packaging Material',
      type: 'dropdown',
      options: ['Cardboard', 'Plastic', 'Metal', 'Wood', 'Mixed'],
      value: '',
      completed: false,
      skipped: false
    },
    {
      id: 'endOfLife',
      label: 'End of Life Scenario',
      type: 'dropdown',
      options: ['Recycling', 'Landfill', 'Incineration', 'Reuse'],
      value: '',
      completed: false,
      skipped: false
    }
  ]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        description: newProject.description,
        functionalUnit: newProject.functionalUnit,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        status: 'Draft',
        type: newProject.type
      };
      setProjects([project, ...projects]);
      setNewProject({ name: '', description: '', functionalUnit: '', type: 'Steel' });
      setShowCreateModal(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      functionalUnit: project.functionalUnit,
      type: project.type
    });
    setShowCreateModal(true);
  };

  const handleUpdateProject = () => {
    if (editingProject && newProject.name.trim()) {
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? {
              ...p,
              name: newProject.name,
              description: newProject.description,
              functionalUnit: newProject.functionalUnit,
              type: newProject.type,
              lastModified: new Date().toISOString().split('T')[0]
            }
          : p
      ));
      setNewProject({ name: '', description: '', functionalUnit: '', type: 'Steel' });
      setEditingProject(null);
      setShowCreateModal(false);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeColor = (type: Project['type']) => {
    switch (type) {
      case 'Steel': return 'bg-purple-500/20 text-purple-400';
      case 'Aluminum': return 'bg-pink-500/20 text-pink-400';
      case 'Copper': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full w-70 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-r border-gray-700/50 z-50 shadow-2xl"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Metis<span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">AI</span>
            </h2>
            <button 
              onClick={toggleSidebar}
              className="cursor-pointer p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Back to Home Button */}
          <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => handleTabChange('dashboard')}
            className={`cursor-pointer flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
              activeTab === 'dashboard' 
                ? 'bg-purple-600/20 border border-purple-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
          >
            <Activity className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-purple-400' : ''}`} />
            <span className={activeTab === 'dashboard' ? 'text-purple-300' : ''}>Dashboard</span>
          </button>
          <button 
            onClick={() => handleTabChange('projects')}
            className={`cursor-pointer flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
              activeTab === 'projects' 
                ? 'bg-purple-600/20 border border-purple-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
          >
            <FolderOpen className={`w-5 h-5 ${activeTab === 'projects' ? 'text-purple-400' : ''}`} />
            <span className={activeTab === 'projects' ? 'text-purple-300' : ''}>My Projects</span>
          </button>
          <button 
            onClick={() => handleTabChange('modeler')}
            className={`cursor-pointer flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
              activeTab === 'modeler' 
                ? 'bg-purple-600/20 border border-purple-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
          >
            <Play className={`w-5 h-5 ${activeTab === 'modeler' ? 'text-purple-400' : ''}`} />
            <span className={activeTab === 'modeler' ? 'text-purple-300' : ''}>Life Cycle Modeler</span>
          </button>
          <button 
            onClick={() => handleTabChange('optimizer')}
            className={`cursor-pointer flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
              activeTab === 'optimizer' 
                ? 'bg-purple-600/20 border border-purple-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
          >
            <Zap className={`w-5 h-5 ${activeTab === 'optimizer' ? 'text-purple-400' : ''}`} />
            <span className={activeTab === 'optimizer' ? 'text-purple-300' : ''}>AI Optimizer & Scenarios</span>
          </button>
          <button 
            onClick={() => handleTabChange('reports')}
            className={`cursor-pointer flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
              activeTab === 'reports' 
                ? 'bg-purple-600/20 border border-purple-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'reports' ? 'text-purple-400' : ''}`} />
            <span className={activeTab === 'reports' ? 'text-purple-300' : ''}>Reports & Exports</span>
          </button>
          
          {/* Separator */}
          <div className="border-t border-gray-700/50 my-4"></div>
          
          <button 
            onClick={() => handleTabChange('settings')}
            className={`cursor-pointer flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
              activeTab === 'settings' 
                ? 'bg-purple-600/20 border border-purple-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-purple-400' : ''}`} />
            <span className={activeTab === 'settings' ? 'text-purple-300' : ''}>Settings</span>
          </button>
          <button 
            onClick={() => handleTabChange('user')}
            className={`cursor-pointer flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
              activeTab === 'user' 
                ? 'bg-purple-600/20 border border-purple-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'user' ? 'text-purple-400' : ''}`} />
            <span className={activeTab === 'user' ? 'text-purple-300' : ''}>User</span>
          </button>
        </nav>
      </motion.div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="relative">
        {/* Top Menu Button */}
        <div className="fixed top-4 left-4 z-30">
          <button 
            onClick={toggleSidebar}
            className="cursor-pointer p-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-lg hover:from-gray-800/80 hover:to-gray-700/80 transition-all duration-300 shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-16">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                AI-Powered LCA{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Dashboard
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
                Welcome to MetisAI Dashboard. Monitor your LCA projects, track progress, and get insights.
              </p>

              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Total Projects</h3>
                    <FolderOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{projects.length}</p>
                  <p className="text-sm text-gray-400">Active projects</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Completed</h3>
                    <BarChart3 className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'Completed').length}</p>
                  <p className="text-sm text-gray-400">Finished analyses</p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">AI Optimizations</h3>
                    <Zap className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">24</p>
                  <p className="text-sm text-gray-400">Scenarios analyzed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Reports</h3>
                    <FileText className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">12</p>
                  <p className="text-sm text-gray-400">Generated reports</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* My Projects Tab */}
          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">My Projects</h1>
                  <p className="text-gray-400">Manage your LCA projects and analysis</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setNewProject({ name: '', description: '', functionalUnit: '', type: 'Steel' });
                    setShowCreateModal(true);
                  }}
                  className="cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Project</span>
                </button>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                        {project.functionalUnit && (
                          <p className="text-purple-400 text-sm font-medium mb-3">
                            Functional Unit: {project.functionalUnit}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="cursor-pointer p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="cursor-pointer p-2 hover:bg-red-700/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Project Status and Type */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(project.type)}`}>
                        {project.type}
                      </span>
                    </div>

                    {/* Project Dates */}
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {project.createdDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Modified: {project.lastModified}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {projects.length === 0 && (
                <div className="text-center py-16">
                  <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-6">Create your first LCA project to get started</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Create Project
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Life Cycle Modeler Tab */}
          {activeTab === 'modeler' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="h-[calc(100vh-100px)] flex overflow-hidden"
            >
              {/* Left Panel - Input Forms */}
              <div className="w-1/3 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-r border-gray-700/30 p-4 overflow-hidden">
                <LifeCycleModeler 
                  inputs={inputs}
                  setInputs={setInputs}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                />
              </div>
              
              {/* Right Panel - Graph Visualization */}
              <div className="flex-1 bg-gradient-to-br from-gray-900/30 to-gray-800/20 p-4 overflow-hidden">
                <ObsidianGraph inputs={inputs} currentStep={currentStep} />
              </div>
            </motion.div>
          )}

          {activeTab === 'optimizer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">AI Optimizer & Scenarios</h1>
              <p className="text-gray-400 mb-8">Optimize your processes with AI-powered scenario analysis</p>
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                <p className="text-gray-400">AI optimization engine is under development</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Reports & Exports</h1>
              <p className="text-gray-400 mb-8">Generate comprehensive reports and export your analysis</p>
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                <p className="text-gray-400">Advanced reporting system in development</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Settings</h1>
              <p className="text-gray-400 mb-8">Configure your MetisAI preferences</p>
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                <p className="text-gray-400">Settings panel under construction</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'user' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <User className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">User Profile</h1>
              <p className="text-gray-400 mb-8">Manage your account and preferences</p>
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                <p className="text-gray-400">User management system being built</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Create/Edit Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter project name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 h-20 resize-none"
                  placeholder="Enter project description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Functional Unit</label>
                <input
                  type="text"
                  value={newProject.functionalUnit}
                  onChange={(e) => setNewProject({ ...newProject, functionalUnit: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 1 ton, 500 kg, 10 liters..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({ ...newProject, type: e.target.value as Project['type'] })}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Steel">Steel</option>
                  <option value="Aluminum">Aluminum</option>
                  <option value="Copper">Copper</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingProject(null);
                  setNewProject({ name: '', description: '', functionalUnit: '', type: 'Steel' });
                }}
                className="cursor-pointer flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingProject ? handleUpdateProject : handleCreateProject}
                className="cursor-pointer flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                {editingProject ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
