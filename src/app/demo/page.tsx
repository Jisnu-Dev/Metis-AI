'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, BarChart3, Menu, X, Settings, User, Users, FolderOpen, Zap, FileText, Activity, Plus, Edit, Trash2, Calendar, Clock, ArrowRight, CheckCircle, XCircle, AlertCircle, Circle, MapPin, Truck, Recycle, Info, Download, Eye, Filter, Search, Bell, Shield, Database, Globe, Palette, Key, EyeOff, Save, RefreshCw, AlertTriangle, Mail, Phone, Building, Lock, Unlock, Monitor, Moon, Sun, HardDrive, Cloud, Wifi, ChevronRight, MoreVertical } from 'lucide-react';
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
  lcaData?: {
    inputs: LCAInput[];
    graphNodes: GraphNode[];
    analysisComplete: boolean;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Engineer' | 'Analyst';
  department: string;
  status: 'Active' | 'Away' | 'Inactive';
  lastLogin: string;
  joinDate: string;
  projectsCount: number;
  avatar: string;
  location: string;
  phone: string;
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
  setCurrentStep,
  onShowMissingValuesPopup,
  onComplete,
  onInputChange,
  viewMode = 'edit',
  currentProject = null
}: { 
  inputs: LCAInput[];
  setInputs: React.Dispatch<React.SetStateAction<LCAInput[]>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onShowMissingValuesPopup: (missingInputs: LCAInput[]) => void;
  onComplete: () => void;
  onInputChange?: () => void;
  readOnly?: boolean;
  viewMode?: 'edit' | 'view';
  currentProject?: Project | null;
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
      // Mark as completed if the input has a value
      completed: value.trim() !== '',
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
      
      // Notify parent of input change
      if (onInputChange) {
        onInputChange();
      }
    }
    
    if (currentStep < inputs.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    // Mark current input as completed if it has a value
    const updatedInputs = [...inputs];
    if (updatedInputs[currentStep].value.trim() !== '') {
      updatedInputs[currentStep] = {
        ...updatedInputs[currentStep],
        completed: true,
        skipped: false
      };
      setInputs(updatedInputs);
    }

    // Check for missing values across ALL inputs (not completed, including skipped)
    const missingInputs = updatedInputs.filter(input => !input.completed);
    
    // Always show popup if there are ANY missing values (including skipped)
    if (missingInputs.length > 0) {
      // Show popup for missing values
      onShowMissingValuesPopup(missingInputs);
    } else {
      // All values are filled, show completion
      onComplete();
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
    
    // Notify parent of input change
    if (onInputChange) {
      onInputChange();
    }
    
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
    <div className="h-full flex flex-col">
      {/* Streamlined Header Section */}
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {viewMode === 'view' && currentProject 
                  ? `${currentProject.name} - Analysis` 
                  : 'Life Cycle Modeler'
                }
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                {viewMode === 'view' 
                  ? 'Viewing completed project analysis' 
                  : 'Configure your LCA parameters'
                }
              </p>
            </div>
          </div>
          
          {/* Start Over Button - only show in edit mode or when there are inputs to reset */}
          {(viewMode === 'edit' || inputs.some(input => input.completed || input.value)) && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to start over? This will clear all current inputs and progress.')) {
                  // We need to call a parent function since this component can't directly access resetToFirstInput
                  // For now, we'll emit an event that the parent can listen to
                  const event = new CustomEvent('resetInputs');
                  window.dispatchEvent(event);
                }
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-300 border border-red-500/30 hover:border-red-400/50 shadow-lg hover:shadow-red-500/25"
              title="Start Over - Reset all inputs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-track-gray-800/30 scrollbar-thumb-purple-500/40 hover:scrollbar-thumb-purple-400/50 scroll-smooth">
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-gray-600/30 rounded-xl sm:rounded-2xl shadow-2xl">
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5 rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20"></div>
          </div>

          <div className="relative z-10 p-4 sm:p-6 min-h-full flex flex-col">
            
            {/* Header with Title & Progress */}
            <div className="mb-4 sm:mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg flex-shrink-0">
                    {currentStep + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">{currentInput.label}</h3>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">Step {currentStep + 1} of {inputs.length}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">
                    {Math.round(((inputs.filter(i => i.completed).length) / inputs.length) * 100)}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Complete</div>
                </div>
              </div>
              
              {/* Step Description */}
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-600/20">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    {getStepIcon(currentInput.id)}
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {getStepDescription(currentInput.id)}
                  </p>
                </div>
              </div>
            </div>

            {/* Your Input Section */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3 uppercase tracking-wide">
                Your Input
              </label>
              
              {currentInput.type === 'dropdown' && (
                <div className="relative">
                  <select
                    value={currentInput.value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-2 border-gray-600/40 focus:border-purple-500/60 hover:border-purple-400/40 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm"
                  >
                    <option value="" className="bg-gray-800">Choose an option...</option>
                    {currentInput.options?.map((option, index) => (
                      <option key={index} value={option} className="bg-gray-800">{option}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-2 border-gray-600/40 focus:border-purple-500/60 hover:border-purple-400/40 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none transition-all duration-300 placeholder-gray-400 text-sm pr-16"
                    placeholder={getPlaceholder(currentInput.id)}
                  />
                  {currentInput.type === 'number' && (
                    <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-purple-300 text-xs sm:text-sm font-medium bg-purple-500/20 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg">
                      {getUnit(currentInput.id)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Status & Tips */}
            <div className="mb-4 sm:mb-6">
              {currentInput.value ? (
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-green-400 text-xs sm:text-sm font-medium">Input Received</div>
                    <div className="text-green-300/80 text-xs sm:text-sm">Ready to proceed</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-blue-400 text-xs sm:text-sm font-medium">Awaiting Input</div>
                    <div className="text-blue-300/80 text-xs sm:text-sm">Enter data above</div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Progress Section */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md sm:rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-200">Overall Progress</span>
                  </div>
                  <div className="text-xs sm:text-sm text-purple-400 font-semibold">
                    {inputs.filter(i => i.completed).length} / {inputs.length}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-700/60 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-500 relative"
                      style={{ width: `${(inputs.filter(i => i.completed).length / inputs.length) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Progress milestones */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1 sm:mt-2">
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

            {/* Flexible spacer to push navigation to bottom */}
            <div className="flex-1"></div>

            {/* Navigation Buttons - Fixed at bottom */}
            <div className="flex items-center justify-between space-x-2 sm:space-x-3 flex-shrink-0 pt-2">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-700/80 to-gray-600/80 hover:from-gray-600/80 hover:to-gray-500/80 disabled:from-gray-800/50 disabled:to-gray-800/50 disabled:text-gray-500 text-white rounded-lg sm:rounded-xl transition-all duration-300 disabled:cursor-not-allowed border border-gray-500/30 hover:border-gray-400/50 disabled:border-gray-700/30 text-xs sm:text-sm font-medium"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              <button
                onClick={handleSkip}
                className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-xs sm:text-sm"
              >
                <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Skip</span>
              </button>
              
              {currentStep === inputs.length - 1 ? (
                <button
                  onClick={handleComplete}
                  className="group flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Complete Analysis</span>
                  <span className="sm:hidden">Complete</span>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-200" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="group flex items-center space-x-1 sm:space-x-2 px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next Step</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Define types for node information
interface NodeResource {
  resource: string;
  amount: string;
  impact: 'high' | 'medium' | 'low';
  icon: string;
}

interface NodeImpact {
  category: string;
  level: 'high' | 'medium' | 'low';
  description: string;
}

interface NodeInfo {
  title: string;
  description: string;
  resourcesDepletedOrUsed: NodeResource[];
  environmentalImpact: NodeImpact[];
  recommendations: string[];
}

// Enhanced Obsidian-style Graph Component with Pan & Zoom
function ObsidianGraph({ 
  inputs, 
  currentStep, 
  selectedNode, 
  setSelectedNode,
  initialNodes,
  onNodesChange,
  onNodeInfoUpdate,
  isLoadingSavedProject
}: { 
  inputs: LCAInput[], 
  currentStep: number,
  selectedNode: GraphNode | null,
  setSelectedNode: (node: GraphNode | null) => void,
  autoFocusOnMount?: boolean,
  analysisComplete?: boolean,
  initialNodes?: GraphNode[],
  onNodesChange?: (nodes: GraphNode[]) => void,
  onNodeInfoUpdate?: (nodeInfo: NodeInfo | null) => void,
  isLoadingSavedProject?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.2 });
  const [targetTransform, setTargetTransform] = useState({ x: 0, y: 0, scale: 1.2 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(0);
  const [userPreferredZoom, setUserPreferredZoom] = useState(1.2);
  const [momentum, setMomentum] = useState({ x: 0, y: 0 });
  
  // Helper function to get current input value
  const getCurrentValue = useCallback((inputId: string) => {
    const input = inputs.find(inp => inp.id === inputId);
    return input?.value || '';
  }, [inputs]);

  // Get detailed node information including resource depletion
  const getNodeInfo = useCallback((node: GraphNode): NodeInfo => {
    const nodeInfo: NodeInfo = {
      title: node.label,
      description: '',
      resourcesDepletedOrUsed: [],
      environmentalImpact: [],
      recommendations: []
    };

    switch (node.id) {
      case 'product':
        nodeInfo.description = 'The product definition stage sets the foundation for your entire LCA. This determines the functional unit and system boundaries.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Administrative Energy', amount: 'Minimal', impact: 'low', icon: '⚡' },
          { resource: 'Digital Storage', amount: '~1 MB', impact: 'low', icon: '💾' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Carbon Footprint', level: 'low', description: 'Minimal emissions from digital activities' }
        ];
        nodeInfo.recommendations = ['Define clear functional units', 'Set appropriate system boundaries'];
        break;

      case 'location':
        nodeInfo.description = 'Geographic location significantly affects energy grid composition, transportation distances, and regulatory frameworks.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Land Use', amount: 'Varies by facility size', impact: 'medium', icon: '🏭' },
          { resource: 'Local Infrastructure', amount: 'Shared usage', impact: 'low', icon: '🛣️' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Carbon Intensity', level: 'high', description: 'Varies by local energy grid (coal vs renewable)' },
          { category: 'Transportation Emissions', level: 'medium', description: 'Distance to suppliers and markets' }
        ];
        nodeInfo.recommendations = ['Choose locations with clean energy grids', 'Minimize transportation distances'];
        break;

      case 'energy':
        nodeInfo.description = 'Energy source selection is critical for environmental impact. Renewable sources dramatically reduce lifecycle emissions.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Fossil Fuels', amount: 'High (if non-renewable)', impact: 'high', icon: '🛢️' },
          { resource: 'Renewable Resources', amount: 'Sustainable (if renewable)', impact: 'low', icon: '🌱' },
          { resource: 'Grid Infrastructure', amount: 'Shared usage', impact: 'medium', icon: '🔌' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'GHG Emissions', level: 'high', description: 'Major contributor to carbon footprint' },
          { category: 'Air Quality', level: 'high', description: 'Fossil fuels create pollutants' },
          { category: 'Resource Depletion', level: 'high', description: 'Non-renewable energy sources' }
        ];
        nodeInfo.recommendations = ['Prioritize renewable energy sources', 'Implement energy efficiency measures', 'Consider on-site solar/wind'];
        break;

      case 'electricity':
        nodeInfo.description = 'Electricity consumption directly correlates with environmental impact based on the local energy grid composition.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Coal/Gas', amount: `${getCurrentValue('electricity') || '0'} kWh × grid factor`, impact: 'high', icon: '⚡' },
          { resource: 'Water (cooling)', amount: '~2-3L per kWh', impact: 'medium', icon: '💧' },
          { resource: 'Grid Capacity', amount: 'Shared infrastructure', impact: 'low', icon: '🔌' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Carbon Emissions', level: 'high', description: `${getCurrentValue('electricity') || '0'} kWh generates significant CO₂` },
          { category: 'Water Consumption', level: 'medium', description: 'Thermoelectric power plants require cooling water' }
        ];
        nodeInfo.recommendations = ['Reduce electricity consumption', 'Use energy-efficient equipment', 'Source from renewable grids'];
        break;

      case 'scrapRate':
        nodeInfo.description = 'Material waste during production represents lost resources and additional environmental burden.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Raw Materials', amount: `${getCurrentValue('scrapRate') || '0'}% waste`, impact: 'medium', icon: '🔨' },
          { resource: 'Processing Energy', amount: 'Wasted on scrapped material', impact: 'medium', icon: '⚡' },
          { resource: 'Landfill Space', amount: 'If not recycled', impact: 'medium', icon: '🗑️' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Resource Efficiency', level: 'medium', description: 'Higher scrap rates mean more resource consumption' },
          { category: 'Waste Generation', level: 'medium', description: 'Increases overall material throughput' }
        ];
        nodeInfo.recommendations = ['Optimize manufacturing processes', 'Implement quality control', 'Design for manufacturability'];
        break;

      case 'scrapFate':
        nodeInfo.description = 'The destination of scrap material significantly affects the overall environmental impact of the production process.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Recycling Energy', amount: 'If recycled', impact: 'low', icon: '♻️' },
          { resource: 'Landfill Space', amount: 'If disposed', impact: 'high', icon: '🗑️' },
          { resource: 'Transportation Fuel', amount: 'To recycling/disposal', impact: 'low', icon: '🚛' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Circular Economy', level: 'high', description: 'Recycling reduces virgin material demand' },
          { category: 'Waste Impact', level: 'high', description: 'Landfilling creates long-term environmental burden' }
        ];
        nodeInfo.recommendations = ['Maximize recycling rates', 'Partner with certified recyclers', 'Design for recyclability'];
        break;

      case 'water':
        nodeInfo.description = 'Water consumption affects local water resources and requires treatment, impacting aquatic ecosystems.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Freshwater', amount: `${getCurrentValue('water') || '0'} L per unit`, impact: 'high', icon: '💧' },
          { resource: 'Treatment Chemicals', amount: 'For water purification', impact: 'medium', icon: '🧪' },
          { resource: 'Energy (pumping/treatment)', amount: '~3-4 kWh per 1000L', impact: 'medium', icon: '⚡' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Water Scarcity', level: 'high', description: 'Depletes local freshwater resources' },
          { category: 'Aquatic Ecosystems', level: 'medium', description: 'Affects water availability for ecosystems' },
          { category: 'Treatment Impact', level: 'medium', description: 'Wastewater requires energy-intensive treatment' }
        ];
        nodeInfo.recommendations = ['Implement water recycling', 'Use water-efficient processes', 'Consider rainwater harvesting'];
        break;

      case 'materialSource':
        nodeInfo.description = 'Raw material sourcing affects transportation emissions, local ecosystems, and supply chain sustainability.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Virgin Materials', amount: 'Primary resource extraction', impact: 'high', icon: '⛏️' },
          { resource: 'Land (mining/forestry)', amount: 'Ecosystem disruption', impact: 'high', icon: '🌲' },
          { resource: 'Water (extraction)', amount: 'Mining and processing', impact: 'medium', icon: '💧' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Biodiversity Loss', level: 'high', description: 'Habitat destruction from resource extraction' },
          { category: 'Soil Degradation', level: 'high', description: 'Mining and logging affect soil quality' },
          { category: 'Transportation Emissions', level: 'medium', description: 'Distance from source to facility' }
        ];
        nodeInfo.recommendations = ['Source from certified sustainable suppliers', 'Minimize transportation distances', 'Use recycled materials when possible'];
        break;

      case 'transportation':
        nodeInfo.description = 'Transportation mode significantly affects fuel consumption, emissions, and delivery timeframes.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Fossil Fuels', amount: 'Varies by mode and distance', impact: 'high', icon: '⛽' },
          { resource: 'Vehicle Infrastructure', amount: 'Shared transportation network', impact: 'medium', icon: '🛣️' },
          { resource: 'Packaging Materials', amount: 'Protection during transport', impact: 'low', icon: '📦' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'GHG Emissions', level: 'high', description: 'Major source of scope 3 emissions' },
          { category: 'Air Pollution', level: 'high', description: 'NOx, particulates from combustion' },
          { category: 'Noise Pollution', level: 'medium', description: 'Traffic noise in urban areas' }
        ];
        nodeInfo.recommendations = ['Choose efficient transportation modes', 'Optimize logistics and routing', 'Consider rail/sea over road/air'];
        break;

      case 'endOfLife':
        nodeInfo.description = 'End-of-life treatment determines whether materials re-enter the economy or become waste, affecting long-term sustainability.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Recycling Infrastructure', amount: 'If recyclable design', impact: 'low', icon: '♻️' },
          { resource: 'Landfill Space', amount: 'If not recyclable', impact: 'high', icon: '🗑️' },
          { resource: 'Incineration Energy', amount: 'Energy recovery possible', impact: 'medium', icon: '🔥' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Circular Economy', level: 'high', description: 'Determines material recovery potential' },
          { category: 'Long-term Pollution', level: 'high', description: 'Landfilled materials may leach toxins' },
          { category: 'Resource Recovery', level: 'high', description: 'Recycling reduces need for virgin materials' }
        ];
        nodeInfo.recommendations = ['Design for disassembly', 'Use recyclable materials', 'Implement take-back programs'];
        break;

      default:
        nodeInfo.description = 'This process step contributes to the overall environmental impact of your product lifecycle.';
        nodeInfo.resourcesDepletedOrUsed = [
          { resource: 'Various Resources', amount: 'Context dependent', impact: 'medium', icon: '🔄' }
        ];
        nodeInfo.environmentalImpact = [
          { category: 'Environmental Impact', level: 'medium', description: 'Specific impacts depend on process details' }
        ];
        nodeInfo.recommendations = ['Define specific process parameters', 'Quantify resource usage'];
    }

    return nodeInfo;
  }, [getCurrentValue]);

  // Update parent with current node info when selectedNode changes
  useEffect(() => {
    if (onNodeInfoUpdate) {
      if (selectedNode) {
        onNodeInfoUpdate(getNodeInfo(selectedNode));
      } else {
        onNodeInfoUpdate(null);
      }
    }
  }, [selectedNode, onNodeInfoUpdate, getNodeInfo]);

  // Auto-focus state for new nodes (using setter only)
  const [, setAutoFocusEnabled] = useState(true);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false); // Track if user has dragged

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

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes || []);

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

  // Reset to overview - centers all nodes and sets appropriate zoom
  const resetToOverview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    
    // Calculate bounding box of all nodes
    const padding = 100;
    const minX = Math.min(...nodes.map(n => n.x)) - padding;
    const maxX = Math.max(...nodes.map(n => n.x)) + padding;
    const minY = Math.min(...nodes.map(n => n.y)) - padding;
    const maxY = Math.max(...nodes.map(n => n.y)) + padding;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Calculate scale to fit all nodes with some padding
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / devicePixelRatio;
    const canvasHeight = canvas.height / devicePixelRatio;
    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const optimalScale = Math.min(scaleX, scaleY, 1.2); // Cap at 1.2x for readability
    
    // Center the view
    const targetX = (canvasWidth / 2) - (centerX * optimalScale);
    const targetY = (canvasHeight / 2) - (centerY * optimalScale);
    
    setTargetTransform({
      x: targetX,
      y: targetY,
      scale: optimalScale
    });
    setUserPreferredZoom(optimalScale);
  }, [nodes]);

  // Smooth camera focus function
  const focusOnNode = useCallback((nodeX: number, nodeY: number, targetScale?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const centerX = (canvas.width / devicePixelRatio) / 2;
    const centerY = (canvas.height / devicePixelRatio) / 2;
    
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
    
    // Also update user preferred zoom to maintain this zoom level
    if (targetScale) {
      setUserPreferredZoom(finalScale);
    }
  }, [userPreferredZoom]);

  // Update nodes when inputs or currentStep changes
  useEffect(() => {
    // Don't regenerate nodes when loading a saved project
    if (isLoadingSavedProject) {
      return;
    }
    
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
      
      // Focus specifically on the NEW node when a new node is added
      if (updatedNodes.length > previousNodeCount && updatedNodes.length > 0) {
        const newNodeIndex = updatedNodes.length - 1; // The newest node
        const newNode = updatedNodes[newNodeIndex];
        
        if (newNode) {
          setTimeout(() => {
            // Focus on the new node with inline logic to avoid dependency issues
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const devicePixelRatio = window.devicePixelRatio || 1;
            const centerX = (canvas.width / devicePixelRatio) / 2;
            const centerY = (canvas.height / devicePixelRatio) / 2;
            
            // Use a good zoom level for the new node
            const focusZoom = Math.max(userPreferredZoom, 1.5);
            
            // Calculate the transform needed to center the node
            const targetX = centerX - newNode.x * focusZoom;
            const targetY = centerY - newNode.y * focusZoom;
            
            setTargetTransform({
              x: targetX,
              y: targetY,
              scale: focusZoom
            });
            
            setUserPreferredZoom(focusZoom);
          }, 300); // Delay to ensure node is properly rendered
        }
      }
      
      // Notify parent that nodes have changed due to input updates (not dragging)
      shouldNotifyParent.current = true;
      
      return updatedNodes;
    });
  }, [inputs, currentStep, isLoadingSavedProject, generateNodes, userPreferredZoom]);

  // Handle initialNodes updates (for loading saved projects)
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      console.log('Loading saved nodes:', initialNodes.length);
      setNodes(initialNodes);
    }
  }, [initialNodes]);

  // Track if we should notify parent (to prevent infinite loops during internal changes)
  const shouldNotifyParent = useRef(false);

  // Notify parent when nodes change (for saving projects) - but only when explicitly requested
  useEffect(() => {
    if (onNodesChange && shouldNotifyParent.current) {
      // Mark this as a user-driven graph update before notifying parent
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userGraphUpdate'));
      }
      onNodesChange(nodes);
      shouldNotifyParent.current = false;
    }
  }, [nodes, onNodesChange]);

  // Auto-focus to overview when component mounts (when modeler tab is opened) - DISABLED
  // useEffect(() => {
  //   if (autoFocusOnMount && nodes.length > 0 && !isFocusingOnNewNode) {
  //     const timer = setTimeout(() => {
  //       // Only reset to overview if we're not currently focusing on a new node
  //       if (!isFocusingOnNewNode) {
  //         resetToOverview();
  //       }
  //     }, 500); // Delay to ensure canvas is ready and nodes are rendered
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [autoFocusOnMount, resetToOverview, nodes.length, isFocusingOnNewNode]);

  // Auto-focus to overview when analysis is completed - DISABLED
  // useEffect(() => {
  //   if (analysisComplete && nodes.length > 0 && !isFocusingOnNewNode) {
  //     const timer = setTimeout(() => {
  //       // Only reset to overview if we're not currently focusing on a new node
  //       if (!isFocusingOnNewNode) {
  //         resetToOverview();
  //       }
  //     }, 800); // Delay to allow for smooth completion transition
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [analysisComplete, nodes.length, resetToOverview, isFocusingOnNewNode]);

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

    setHasDragged(false); // Reset drag flag on mouse down

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
      setHasDragged(true); // Mark that dragging has occurred
      
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
      setHasDragged(true); // Mark that dragging has occurred
      
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

  // Reset view function that doesn't cause infinite loops
  const resetView = useCallback(() => {
    setTargetTransform({ x: 0, y: 0, scale: 1.2 });
    setUserPreferredZoom(1.2);
  }, []);

  // Additional redraw trigger specifically for smooth closing transitions
  const prevSelectedNodeRef = useRef(selectedNode);
  const resetToOverviewRef = useRef(resetToOverview);
  
  // Update the ref whenever resetToOverview changes
  useEffect(() => {
    resetToOverviewRef.current = resetToOverview;
  }, [resetToOverview]);
  
  useEffect(() => {
    const prevSelectedNode = prevSelectedNodeRef.current;
    prevSelectedNodeRef.current = selectedNode;

    // If we just closed the panel (had a node, now don't)
    if (prevSelectedNode && !selectedNode) {
      const closeRedrawTimeout = setTimeout(() => {
        // Ensure canvas adapts to the expanded width smoothly
        setTransform(prev => ({ ...prev }));
      }, 200); // Later in the closing transition for smoother feel

      // Smoothly zoom back to overview when panel closes
      const overviewTimeout = setTimeout(() => {
        resetToOverviewRef.current();
      }, 100); // Start overview transition early in panel close

      return () => {
        clearTimeout(closeRedrawTimeout);
        clearTimeout(overviewTimeout);
      };
    }
  }, [selectedNode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Don't open panel if user was dragging
    if (hasDragged) {
      return;
    }

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

    // Only set selected node if a node was actually clicked
    // Clicking on empty space no longer clears the selection
    if (clickedNode) {
      setSelectedNode(clickedNode);
      // Immediately start focusing on the clicked node for smooth UX
      focusOnNode(clickedNode.x, clickedNode.y);
    }
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

// Reports and Exports Component
function ReportsAndExports({ 
  projects
}: { 
  projects: Project[];
}) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'comparative'>('summary');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'active'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter projects based on status and search term
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'completed' && project.status === 'Completed') ||
                         (filterStatus === 'active' && project.status === 'Active');
    return matchesSearch && matchesFilter;
  });

  // Get completed projects with LCA data
  const completedProjects = filteredProjects.filter(p => p.status === 'Completed' && p.lcaData);

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Select all visible projects
  const selectAllProjects = () => {
    const completedProjectIds = completedProjects.map(p => p.id);
    setSelectedProjects(completedProjectIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedProjects([]);
  };

  // Generate CSV data for export
  const generateCSVData = (projects: Project[]) => {
    const csvData = [];
    
    // Add header row
    csvData.push([
      'Project Name',
      'Type',
      'Functional Unit',
      'Status',
      'Created Date',
      'Last Modified',
      'Completion Rate',
      'Factory Location',
      'Energy Source',
      'Transportation',
      'Packaging',
      'End of Life Treatment'
    ]);

    // Add project data
    projects.forEach(project => {
      if (project.lcaData) {
        const inputs = project.lcaData.inputs;
        const completedCount = inputs.filter(input => input.completed).length;
        const completionRate = `${Math.round((completedCount / inputs.length) * 100)}%`;
        
        csvData.push([
          project.name,
          project.type,
          project.functionalUnit,
          project.status,
          project.createdDate,
          project.lastModified,
          completionRate,
          inputs.find(i => i.id === 'location')?.value || 'N/A',
          inputs.find(i => i.id === 'energy')?.value || 'N/A',
          inputs.find(i => i.id === 'transportation')?.value || 'N/A',
          inputs.find(i => i.id === 'packaging')?.value || 'N/A',
          inputs.find(i => i.id === 'endOfLife')?.value || 'N/A'
        ]);
      }
    });

    return csvData;
  };

  // Export to CSV
  const exportToCSV = async () => {
    if (selectedProjects.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const Papa = (await import('papaparse')).default;
      
      const selectedProjectData = projects.filter(p => selectedProjects.includes(p.id));
      const csvData = generateCSVData(selectedProjectData);
      
      const csv = Papa.unparse(csvData);
      
      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lca-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
    
    setIsGenerating(false);
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (selectedProjects.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Dynamic imports to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      
      const selectedProjectData = projects.filter(p => selectedProjects.includes(p.id));
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(51, 51, 51);
      pdf.text('MetisAI - LCA Analysis Report', margin, yPosition);
      yPosition += 15;

      // Add generation date
      pdf.setFontSize(12);
      pdf.setTextColor(102, 102, 102);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;

      // Add summary
      pdf.setFontSize(14);
      pdf.setTextColor(51, 51, 51);
      pdf.text(`Report Summary: ${selectedProjectData.length} Projects`, margin, yPosition);
      yPosition += 20;

      // Add project details
      selectedProjectData.forEach((project, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        // Project header
        pdf.setFontSize(16);
        pdf.setTextColor(76, 29, 149); // Purple color
        pdf.text(`${index + 1}. ${project.name}`, margin, yPosition);
        yPosition += 8;

        // Project details
        pdf.setFontSize(11);
        pdf.setTextColor(51, 51, 51);
        
        const details = [
          `Type: ${project.type}`,
          `Functional Unit: ${project.functionalUnit}`,
          `Status: ${project.status}`,
          `Created: ${project.createdDate}`,
          `Last Modified: ${project.lastModified}`
        ];

        details.forEach(detail => {
          pdf.text(detail, margin + 5, yPosition);
          yPosition += 6;
        });

        // LCA Data if available
        if (project.lcaData) {
          yPosition += 5;
          pdf.setFontSize(12);
          pdf.setTextColor(76, 29, 149);
          pdf.text('LCA Analysis Data:', margin + 5, yPosition);
          yPosition += 8;

          pdf.setFontSize(10);
          pdf.setTextColor(51, 51, 51);

          const completedInputs = project.lcaData.inputs.filter(input => input.completed);
          const completionRate = Math.round((completedInputs.length / project.lcaData.inputs.length) * 100);
          
          pdf.text(`Completion Rate: ${completionRate}%`, margin + 10, yPosition);
          yPosition += 6;

          // Add input details
          project.lcaData.inputs.forEach(input => {
            if (input.completed && input.value) {
              const text = `${input.label}: ${input.value}`;
              pdf.text(text, margin + 10, yPosition);
              yPosition += 5;
            }
          });
        }

        yPosition += 10; // Space between projects
      });

      // Add footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Generated by MetisAI - AI-Powered Life Cycle Assessment Platform', margin, footerY);

      // Save PDF
      pdf.save(`lca-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
    
    setIsGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-400" />
            Reports & Exports
          </h1>
          <p className="text-gray-400">Generate comprehensive reports and export your LCA analysis data</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'active')}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 appearance-none"
            >
              <option value="all">All Projects</option>
              <option value="completed">Completed Only</option>
              <option value="active">Active Only</option>
            </select>
          </div>

          {/* Report Type */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'summary' | 'detailed' | 'comparative')}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 appearance-none"
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
            <option value="comparative">Comparative Analysis</option>
          </select>

          {/* Selection Controls */}
          <div className="flex space-x-2">
            <button
              onClick={selectAllProjects}
              className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 font-medium py-2 px-3 rounded-lg transition-all duration-300 text-sm"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-gray-200 font-medium py-2 px-3 rounded-lg transition-all duration-300 text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportToPDF}
            disabled={selectedProjects.length === 0 || isGenerating}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Export PDF'}</span>
          </button>

          <button
            onClick={exportToCSV}
            disabled={selectedProjects.length === 0 || isGenerating}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Export CSV'}</span>
          </button>

          <div className="text-sm text-gray-400 flex items-center">
            {selectedProjects.length > 0 && (
              <span>{selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Available Projects ({completedProjects.length})</h2>
        
        {completedProjects.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-8 text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Completed Projects</h3>
            <p className="text-gray-500">Complete some LCA analyses to generate reports</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedProjects.includes(project.id)
                    ? 'border-purple-500/50 bg-purple-900/20'
                    : 'border-gray-700/30 hover:border-gray-600/50'
                }`}
                onClick={() => toggleProjectSelection(project.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedProjects.includes(project.id)
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-500'
                  }`}>
                    {selectedProjects.includes(project.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{project.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="px-2 py-1 rounded text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-500/30">
                      {project.status}
                    </span>
                  </div>
                  {project.lcaData && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Completion:</span>
                      <span className="text-white">
                        {Math.round((project.lcaData.inputs.filter(input => input.completed).length / project.lcaData.inputs.length) * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Modified:</span>
                    <span className="text-white">{project.lastModified}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Preview */}
      {selectedProjects.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-400" />
            Report Preview
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{selectedProjects.length}</div>
                <div className="text-sm text-gray-400">Projects</div>
              </div>
              <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {projects.filter(p => selectedProjects.includes(p.id) && p.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">
                  {projects.filter(p => selectedProjects.includes(p.id)).reduce((acc, p) => {
                    return acc + new Set(p.type ? [p.type] : []).size;
                  }, 0)}
                </div>
                <div className="text-sm text-gray-400">Types</div>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">
                  {Math.round(
                    projects
                      .filter(p => selectedProjects.includes(p.id) && p.lcaData)
                      .reduce((acc, p) => {
                        const completionRate = (p.lcaData!.inputs.filter(input => input.completed).length / p.lcaData!.inputs.length) * 100;
                        return acc + completionRate;
                      }, 0) / selectedProjects.length || 0
                  )}%
                </div>
                <div className="text-sm text-gray-400">Avg Completion</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// AI Optimizer Component - Redesigned to be consistent with other pages
function AIOptimizerPanel({ projects, onGraphViewChange }: { projects: Project[], onGraphViewChange: (showing: boolean) => void }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Steel' | 'Aluminum' | 'Copper' | 'Other'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'nodes'>('name');
  
  // Filter completed projects
  const completedProjects = projects.filter(project => project.status === 'Completed');
  
  // Apply search and filter
  const filteredProjects = completedProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || project.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'nodes':
        return (b.lcaData?.graphNodes?.length || 0) - (a.lcaData?.graphNodes?.length || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowGraph(true);
    onGraphViewChange(true);
  };

  const handleBackToProjects = () => {
    setShowGraph(false);
    setSelectedProject(null);
    onGraphViewChange(false);
  };

  const ProjectGraphVisualization = ({ project }: { project: Project }) => {
    const graphNodes = project.lcaData?.graphNodes || [];
    const inputs = project.lcaData?.inputs || [];
    
    if (graphNodes.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center h-full"
        >
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-12 text-center max-w-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl font-bold text-orange-300 mb-4"
            >
              No Analysis Data Available
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-400 leading-relaxed"
            >
              This project needs to be completed in the Life Cycle Modeler to generate the AI-powered process flow visualization and environmental impact analysis.
            </motion.p>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="w-full h-full overflow-hidden relative">
        <ObsidianGraph 
          inputs={inputs}
          currentStep={inputs.length - 1}
          selectedNode={null}
          setSelectedNode={() => {}}
          autoFocusOnMount={true}
          analysisComplete={true}
          initialNodes={graphNodes}
          onNodesChange={() => {}}
          onNodeInfoUpdate={() => {}}
          isLoadingSavedProject={false}
        />
      </div>
    );
  };

  // Show graph view when a project is selected
  if (showGraph && selectedProject) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 border-b border-gray-700/30 bg-gray-900/50 backdrop-blur-xl flex-shrink-0"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBackToProjects}
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-gray-600/50 rounded-lg px-4 py-2 hover:from-gray-700/60 hover:to-gray-600/60 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300 text-sm">Back to Projects</span>
                </motion.button>
                
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div className="text-center">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl font-bold text-white"
                >
                  {selectedProject.name}
                </motion.h1>
                <p className="text-gray-400 text-sm">AI-Powered LCA Process Visualization</p>
              </div>

              <div className="flex items-center gap-3">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 text-sm font-medium">Completed</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex items-center gap-2 bg-gray-800/50 border border-gray-600/30 rounded-lg px-3 py-1.5"
                >
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-medium">{selectedProject.lcaData?.graphNodes?.length || 0} nodes</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Graph container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 flex-1 min-h-0 w-full overflow-hidden"
        >
          <ProjectGraphVisualization project={selectedProject} />
        </motion.div>
      </div>
    );
  }

  // Show main optimizer interface
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Zap className="w-8 h-8 mr-3 text-yellow-400" />
            AI Optimizer & Scenarios
          </h1>
          <p className="text-gray-400">Analyze and optimize LCA processes using AI-powered insights</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search completed projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'Steel' | 'Aluminum' | 'Copper' | 'Other')}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="Steel">Steel</option>
              <option value="Aluminum">Aluminum</option>
              <option value="Copper">Copper</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'nodes')}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 appearance-none"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="nodes">Sort by Complexity</option>
          </select>

          {/* Stats */}
          <div className="flex items-center justify-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg px-4 py-2">
            <span className="text-purple-300 text-sm font-medium">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{completedProjects.length}</p>
                <p className="text-sm text-gray-400">Completed Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(completedProjects.reduce((acc, p) => acc + (p.lcaData?.graphNodes?.length || 0), 0) / completedProjects.length) || 0}
                </p>
                <p className="text-sm text-gray-400">Avg. Complexity</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{completedProjects.length * 3}</p>
                <p className="text-sm text-gray-400">AI Optimizations</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{completedProjects.length * 2}</p>
                <p className="text-sm text-gray-400">Scenarios Analyzed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-purple-400" />
          Available Projects ({filteredProjects.length})
        </h2>
        
        {filteredProjects.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-12 text-center">
            {completedProjects.length === 0 ? (
              <>
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-orange-300 mb-2">No Completed Projects</h3>
                <p className="text-gray-500">Complete some LCA analyses in the Life Cycle Modeler to access AI optimization features</p>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No Projects Found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 hover:border-purple-500/30 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group"
                onClick={() => handleProjectSelect(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                      <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{project.name}</h3>
                      <p className="text-gray-400 text-sm">{project.type} • {project.functionalUnit}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Completed:</span>
                    <span className="text-white">{project.lastModified}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Graph Nodes:</span>
                    <span className="text-purple-400 font-medium">{project.lcaData?.graphNodes?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">AI Score:</span>
                    <span className="text-green-400 font-medium">{Math.round(Math.random() * 30 + 70)}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded border border-green-500/30">
                    Completed
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded border border-blue-500/30">
                    {project.type}
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded border border-purple-500/30">
                    Optimized
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UserManagementPanel() {
  const [activeView, setActiveView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock user data
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Jisnu Saravanan',
      email: 'jisnu.saravanan@metalcorp.com',
      role: 'Admin',
      department: 'Sustainability & LCA',
      status: 'Active',
      lastLogin: '2 hours ago',
      joinDate: '2024-01-15',
      projectsCount: 24,
      avatar: 'JS',
      location: 'Pittsburgh, PA',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah.chen@metalcorp.com',
      role: 'Engineer',
      department: 'Process Engineering',
      status: 'Active',
      lastLogin: '1 day ago',
      joinDate: '2024-02-20',
      projectsCount: 18,
      avatar: 'SC',
      location: 'Detroit, MI',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@metalcorp.com',
      role: 'Manager',
      department: 'Quality Assurance',
      status: 'Active',
      lastLogin: '3 hours ago',
      joinDate: '2023-11-10',
      projectsCount: 31,
      avatar: 'MR',
      location: 'Houston, TX',
      phone: '+1 (555) 345-6789'
    },
    {
      id: 4,
      name: 'Emma Thompson',
      email: 'emma.thompson@metalcorp.com',
      role: 'Analyst',
      department: 'Research & Development',
      status: 'Away',
      lastLogin: '2 days ago',
      joinDate: '2024-03-05',
      projectsCount: 12,
      avatar: 'ET',
      location: 'Seattle, WA',
      phone: '+1 (555) 456-7890'
    },
    {
      id: 5,
      name: 'David Kim',
      email: 'david.kim@metalcorp.com',
      role: 'Engineer',
      department: 'Environmental Compliance',
      status: 'Inactive',
      lastLogin: '1 week ago',
      joinDate: '2023-08-22',
      projectsCount: 8,
      avatar: 'DK',
      location: 'Los Angeles, CA',
      phone: '+1 (555) 567-8901'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@metalcorp.com',
      role: 'Manager',
      department: 'Materials Science',
      status: 'Active',
      lastLogin: '4 hours ago',
      joinDate: '2023-12-01',
      projectsCount: 22,
      avatar: 'LA',
      location: 'Phoenix, AZ',
      phone: '+1 (555) 678-9012'
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    inactive: users.filter(u => u.status === 'Inactive').length,
    away: users.filter(u => u.status === 'Away').length,
    admins: users.filter(u => u.role === 'Admin').length,
    managers: users.filter(u => u.role === 'Manager').length,
    engineers: users.filter(u => u.role === 'Engineer').length,
    analysts: users.filter(u => u.role === 'Analyst').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/20';
      case 'Away': return 'text-yellow-400 bg-yellow-400/20';
      case 'Inactive': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'text-purple-400 bg-purple-400/20';
      case 'Manager': return 'text-blue-400 bg-blue-400/20';
      case 'Engineer': return 'text-green-400 bg-green-400/20';
      case 'Analyst': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400">Manage team members and access permissions</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'All Users', icon: Users },
          { id: 'roles', label: 'Roles & Permissions', icon: Shield },
          { id: 'activity', label: 'Activity Log', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === tab.id
                ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.total}</p>
                  <p className="text-gray-400 text-sm">Total Users</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                +2 this month
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.active}</p>
                  <p className="text-gray-400 text-sm">Active Users</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {Math.round((userStats.active / userStats.total) * 100)}% online rate
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.admins}</p>
                  <p className="text-gray-400 text-sm">Administrators</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                System access level
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-white">6</p>
                  <p className="text-gray-400 text-sm">Departments</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Across organization
              </div>
            </div>
          </div>

          {/* Recent Activity & Department Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { user: 'Jisnu Saravanan', action: 'Created new project', time: '2 hours ago', type: 'create' },
                  { user: 'Sarah Chen', action: 'Updated profile settings', time: '4 hours ago', type: 'update' },
                  { user: 'Michael Rodriguez', action: 'Completed LCA analysis', time: '6 hours ago', type: 'complete' },
                  { user: 'Emma Thompson', action: 'Logged in from new device', time: '1 day ago', type: 'login' },
                  { user: 'Lisa Anderson', action: 'Generated sustainability report', time: '2 days ago', type: 'report' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'create' ? 'bg-green-400' :
                      activity.type === 'update' ? 'bg-blue-400' :
                      activity.type === 'complete' ? 'bg-purple-400' :
                      activity.type === 'login' ? 'bg-yellow-400' :
                      'bg-orange-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                Department Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Sustainability & LCA', count: 1, color: 'bg-green-400' },
                  { name: 'Process Engineering', count: 1, color: 'bg-blue-400' },
                  { name: 'Quality Assurance', count: 1, color: 'bg-purple-400' },
                  { name: 'Research & Development', count: 1, color: 'bg-orange-400' },
                  { name: 'Environmental Compliance', count: 1, color: 'bg-yellow-400' },
                  { name: 'Materials Science', count: 1, color: 'bg-red-400' }
                ].map((dept, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                    <div className="flex-1 flex justify-between">
                      <span className="text-gray-300 text-sm">{dept.name}</span>
                      <span className="text-white font-medium">{dept.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeView === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, emails, or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Engineer">Engineer</option>
              <option value="Analyst">Analyst</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Away">Away</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {user.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDetails(true);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{user.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{user.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{user.projectsCount}</p>
                    <p className="text-gray-400 text-xs">Projects</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-gray-400 text-xs">Last login: {user.lastLogin}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeView === 'roles' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Role Permissions Matrix
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-300">Permission</th>
                    <th className="text-center p-3 text-purple-400">Admin</th>
                    <th className="text-center p-3 text-blue-400">Manager</th>
                    <th className="text-center p-3 text-green-400">Engineer</th>
                    <th className="text-center p-3 text-orange-400">Analyst</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { permission: 'Create Projects', admin: true, manager: true, engineer: true, analyst: false },
                    { permission: 'Edit All Projects', admin: true, manager: true, engineer: false, analyst: false },
                    { permission: 'Delete Projects', admin: true, manager: false, engineer: false, analyst: false },
                    { permission: 'Generate Reports', admin: true, manager: true, engineer: true, analyst: true },
                    { permission: 'Manage Users', admin: true, manager: false, engineer: false, analyst: false },
                    { permission: 'System Settings', admin: true, manager: false, engineer: false, analyst: false },
                    { permission: 'Export Data', admin: true, manager: true, engineer: true, analyst: true },
                    { permission: 'View Analytics', admin: true, manager: true, engineer: true, analyst: true }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 text-white">{row.permission}</td>
                      <td className="p-3 text-center">
                        {row.admin ? <CheckCircle className="w-5 h-5 text-green-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}
                      </td>
                      <td className="p-3 text-center">
                        {row.manager ? <CheckCircle className="w-5 h-5 text-green-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}
                      </td>
                      <td className="p-3 text-center">
                        {row.engineer ? <CheckCircle className="w-5 h-5 text-green-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}
                      </td>
                      <td className="p-3 text-center">
                        {row.analyst ? <CheckCircle className="w-5 h-5 text-green-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeView === 'activity' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              System Activity Log
            </h3>
            
            <div className="space-y-3">
              {[
                { user: 'Jisnu Saravanan', action: 'Logged in from new IP address', time: '2 hours ago', type: 'security', severity: 'medium' },
                { user: 'Sarah Chen', action: 'Updated project "Steel Production Analysis"', time: '3 hours ago', type: 'project', severity: 'low' },
                { user: 'System', action: 'Automated backup completed successfully', time: '4 hours ago', type: 'system', severity: 'low' },
                { user: 'Michael Rodriguez', action: 'Generated compliance report', time: '5 hours ago', type: 'report', severity: 'low' },
                { user: 'Admin', action: 'User permissions updated for Emma Thompson', time: '6 hours ago', type: 'admin', severity: 'high' },
                { user: 'Emma Thompson', action: 'Failed login attempt (incorrect password)', time: '1 day ago', type: 'security', severity: 'medium' },
                { user: 'David Kim', action: 'Account deactivated by administrator', time: '2 days ago', type: 'admin', severity: 'high' },
                { user: 'Lisa Anderson', action: 'Exported project data', time: '2 days ago', type: 'data', severity: 'medium' }
              ].map((log, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    log.severity === 'high' ? 'bg-red-400' :
                    log.severity === 'medium' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{log.user}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.type === 'security' ? 'bg-red-400/20 text-red-400' :
                        log.type === 'admin' ? 'bg-purple-400/20 text-purple-400' :
                        log.type === 'project' ? 'bg-blue-400/20 text-blue-400' :
                        log.type === 'system' ? 'bg-gray-400/20 text-gray-400' :
                        log.type === 'report' ? 'bg-green-400/20 text-green-400' :
                        'bg-orange-400/20 text-orange-400'
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{log.action}</p>
                  </div>
                  <div className="text-gray-400 text-sm">{log.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function BasicSettingsPanel() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    reports: true,
    projects: true,
    maintenance: false
  });
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState('en-US');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dataRetention, setDataRetention] = useState('12');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-2 px-6 pb-6 space-y-6"
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
            <Settings className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and configuration</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Profile Information</h3>
            </div>
            
            {/* Profile Picture */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  JS
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div>
                <button className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors mr-2">
                  Change Photo
                </button>
                <button className="px-4 py-2 bg-gray-600/20 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-600/30 transition-colors">
                  Remove
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input 
                    type="text" 
                    defaultValue="Jisnu"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue="Saravanan"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="jisnu.saravanan@metalcorp.com"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                  <input 
                    type="text" 
                    defaultValue="Senior Metallurgical Engineer"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
                  <input 
                    type="text" 
                    defaultValue="MetalCorp Industries"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input 
                    type="text" 
                    defaultValue="Pittsburgh, PA"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea 
                  rows={3}
                  defaultValue="Experienced metallurgical engineer specializing in sustainable manufacturing processes and lifecycle assessment for metal production industries."
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Security & Authentication</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input 
                    type="password"
                    placeholder="Enter new password"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input 
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <p className="text-orange-300 font-medium">Security Recommendations</p>
                </div>
                <ul className="text-orange-200 text-sm space-y-1">
                  <li>• Use a strong password with at least 12 characters</li>
                  <li>• Enable two-factor authentication for enhanced security</li>
                  <li>• Change your password regularly (every 90 days)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Notification Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-gray-400 text-sm">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.email}
                    onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-gray-400 text-sm">Browser push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.push}
                    onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">SMS Alerts</p>
                  <p className="text-gray-400 text-sm">Critical alerts via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.sms}
                    onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">Weekly Reports</p>
                  <p className="text-gray-400 text-sm">Weekly analysis summaries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.reports}
                    onChange={(e) => setNotifications(prev => ({ ...prev, reports: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">Project Updates</p>
                  <p className="text-gray-400 text-sm">Notifications for project changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.projects}
                    onChange={(e) => setNotifications(prev => ({ ...prev, projects: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">System Maintenance</p>
                  <p className="text-gray-400 text-sm">System update notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.maintenance}
                    onChange={(e) => setNotifications(prev => ({ ...prev, maintenance: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Application Preferences</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-gray-400 text-sm">Use dark theme interface</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium">Auto-Save</p>
                  <p className="text-gray-400 text-sm">Automatically save your work</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-UK">English (UK)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data Retention Period</label>
                <select 
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data & Privacy Section */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Data & Privacy</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  <p className="text-blue-300 font-medium">Export Your Data</p>
                </div>
                <p className="text-blue-200 text-sm mb-3">Download all your account data and project information</p>
                <button className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-colors text-sm">
                  Request Data Export
                </button>
              </div>
              
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <p className="text-red-300 font-medium">Delete Account</p>
                </div>
                <p className="text-red-200 text-sm mb-3">Permanently delete your account and all associated data</p>
                <button className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-colors text-sm">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-8">
        <button className="px-12 py-4 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors font-medium text-lg">
          Save All Changes
        </button>
      </div>
    </motion.div>
  );
}

function SettingsContent({ activeSection }: { activeSection: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'email', title: 'Email Notifications', description: 'Receive updates via email', enabled: true },
    { id: 'push', title: 'Push Notifications', description: 'Browser push notifications', enabled: false },
    { id: 'sms', title: 'SMS Alerts', description: 'Critical alerts via SMS', enabled: false },
    { id: 'reports', title: 'Weekly Reports', description: 'Weekly analysis summaries', enabled: true },
    { id: 'projects', title: 'Project Updates', description: 'Notifications for project changes', enabled: true },
    { id: 'system', title: 'System Maintenance', description: 'System update notifications', enabled: true }
  ]);

  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [dataRetention, setDataRetention] = useState('12');
  const [apiUsage, setApiUsage] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('weekly');

  const settingSections = [
    {
      id: 'profile',
      title: 'User Profile',
      description: 'Manage your personal information and account details',
      icon: <User className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure how you receive updates and alerts',
      icon: <Bell className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage security settings and data privacy',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Control data storage, export, and retention',
      icon: <Database className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience and interface',
      icon: <Palette className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Advanced configuration and performance settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const dataUsageStats = [
    { category: 'Projects', usage: 12, total: 50, unit: 'projects', color: 'bg-blue-500' },
    { category: 'Storage', usage: 2.4, total: 10, unit: 'GB', color: 'bg-purple-500' },
    { category: 'API Calls', usage: 1250, total: 5000, unit: 'calls', color: 'bg-green-500' },
    { category: 'Reports', usage: 8, total: 25, unit: 'reports', color: 'bg-orange-500' }
  ];

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                JS
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <button className="mt-4 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors">
              Change Photo
            </button>
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Jisnu Saravanan</h2>
            <p className="text-gray-300 mb-1">Senior Metallurgical Engineer</p>
            <p className="text-gray-400 mb-4">MetalCorp Industries</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">jisnu.saravanan@metalcorp.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">Pittsburgh, PA</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">Sustainability & LCA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
            <input 
              type="text" 
              defaultValue="Jisnu"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
            <input 
              type="text" 
              defaultValue="Saravanan"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              defaultValue="jisnu.saravanan@metalcorp.com"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input 
              type="tel" 
              defaultValue="+1 (555) 123-4567"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
            <input 
              type="date" 
              defaultValue="1990-05-15"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
              <option>Prefer not to say</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Professional Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
            <input 
              type="text" 
              defaultValue="Senior Metallurgical Engineer"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
            <input 
              type="text" 
              defaultValue="MetalCorp Industries"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
              <option>Sustainability & LCA</option>
              <option>Production Engineering</option>
              <option>Quality Assurance</option>
              <option>Research & Development</option>
              <option>Environmental Compliance</option>
              <option>Process Engineering</option>
              <option>Materials Science</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
            <input 
              type="text" 
              defaultValue="EMP-2024-001234"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Work Location</label>
            <input 
              type="text" 
              defaultValue="Pittsburgh, PA, United States"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Account Activity</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-sm text-gray-400">Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">18</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">42</p>
                <p className="text-sm text-gray-400">Reports</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-gray-400">Months</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">{notif.title}</h4>
                <p className="text-sm text-gray-400">{notif.description}</p>
              </div>
              <button
                onClick={() => toggleNotification(notif.id)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notif.enabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notif.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Timing */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          Notification Timing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Quiet Hours Start</label>
            <input 
              type="time" 
              defaultValue="22:00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Quiet Hours End</label>
            <input 
              type="time" 
              defaultValue="08:00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Password & Authentication */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-green-400" />
          Password & Authentication
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input 
              type="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input 
              type="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="font-medium text-white">SMS Authentication</h4>
            <p className="text-sm text-gray-400">Receive verification codes via SMS</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Enable
          </button>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-400" />
          Active Sessions
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-gray-400">Windows • Chrome • Pittsburgh, PA</p>
              </div>
            </div>
            <span className="text-green-400 text-sm font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium">Mobile Device</p>
                <p className="text-sm text-gray-400">iOS • Safari • 2 hours ago</p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm font-medium">
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      {/* Data Usage Overview */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Data Usage Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {dataUsageStats.map((stat, index) => (
            <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{stat.category}</span>
                <span className="text-sm text-gray-400">
                  {stat.usage} / {stat.total} {stat.unit}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`${stat.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(stat.usage / stat.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-green-400" />
          Data Export
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium">Export All Projects</h4>
              <p className="text-sm text-gray-400">Download all your LCA projects and data</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium">Export Reports</h4>
              <p className="text-sm text-gray-400">Download generated reports and analytics</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-purple-400" />
          Data Retention Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Data Retention Period</label>
            <select 
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="indefinite">Indefinite</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Data older than this period will be automatically deleted</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Backup Frequency</label>
            <select 
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      {/* Interface Preferences */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          Interface Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="font-medium">Dark Mode</h4>
                <p className="text-sm text-gray-400">Use dark theme across the application</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="font-medium">Auto-save</h4>
                <p className="text-sm text-gray-400">Automatically save changes as you work</p>
              </div>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoSave ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoSave ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Language & Region
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese (Simplified)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Timezone</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC-6 (Central Time)</option>
              <option>UTC-7 (Mountain Time)</option>
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (CET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date Format</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Number Format</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>1,234.56</option>
              <option>1.234,56</option>
              <option>1 234,56</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      {/* API Configuration */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          API Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium">API Usage Monitoring</h4>
              <p className="text-sm text-gray-400">Track API calls and performance metrics</p>
            </div>
            <button
              onClick={() => setApiUsage(!apiUsage)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                apiUsage ? 'bg-yellow-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  apiUsage ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">API Rate Limit</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Standard (100 calls/hour)</option>
              <option>Enhanced (500 calls/hour)</option>
              <option>Premium (1000 calls/hour)</option>
              <option>Unlimited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Performance Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cache Duration</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>1 hour</option>
              <option>6 hours</option>
              <option>24 hours</option>
              <option>7 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Concurrent Processes</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>2 processes</option>
              <option>4 processes</option>
              <option>8 processes</option>
              <option>Auto-detect</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span>v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Update:</span>
              <span>Sep 1, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">License:</span>
              <span>Enterprise</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span>99.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Server:</span>
              <span>US-East-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'security':
        return renderSecuritySection();
      case 'data':
        return renderDataSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'system':
        return renderSystemSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
            <Settings className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and configuration</p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderActiveSection()}
      </motion.div>
    </motion.div>
  );
}

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAnalysisView, setShowAnalysisView] = useState(false);
  const [analysisProject, setAnalysisProject] = useState<Project | null>(null);
  const [analysisSelectedNode, setAnalysisSelectedNode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [optimizerGraphView, setOptimizerGraphView] = useState(false); // Track AI optimizer graph view
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
      status: 'Draft',
      type: 'Copper'
    }
  ]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    functionalUnit: '',
    type: 'Steel' as Project['type']
  });

  // Current project being worked on in the modeler
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Project view mode - 'edit' for creating/editing, 'view' for viewing completed projects
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');

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

  // Node selection state for the sliding panel
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [currentNodeInfo, setCurrentNodeInfo] = useState<NodeInfo | null>(null);

  // Missing values popup state
  const [showMissingValuesPopup, setShowMissingValuesPopup] = useState(false);
  const [missingInputs, setMissingInputs] = useState<LCAInput[]>([]);
  const [isFillingMissingValues, setIsFillingMissingValues] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Graph nodes state for saving projects
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [projectSaved, setProjectSaved] = useState(false);
  const [showSaveProjectPrompt, setShowSaveProjectPrompt] = useState(false);
  const [isUserGraphUpdate, setIsUserGraphUpdate] = useState(false);
  const [isLoadingSavedProject, setIsLoadingSavedProject] = useState(false);

  // Helper function to get current input value
  const getCurrentValue = (inputId: string) => {
    const input = inputs.find(inp => inp.id === inputId);
    return input?.value || '';
  };

  // Helper function to check if product selection matches existing project
  const getProjectMatchInfo = () => {
    const productSelection = getCurrentValue('product');
    const existingProject = projects.find(p => 
      `${p.name} (${p.functionalUnit})` === productSelection
    );
    
    return {
      isExistingProject: !!existingProject,
      project: existingProject,
      productSelection: productSelection
    };
  };

  // Reset inputs to start from the beginning
  const resetToFirstInput = useCallback(() => {
    // Reset to fresh inputs
    const freshInputs: LCAInput[] = [
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
        label: 'Scrap Rate (%)',
        type: 'number',
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'scrapFate',
        label: 'Scrap Material Fate',
        type: 'dropdown',
        options: ['Recycled Internally', 'Sold to External Recycler', 'Landfilled', 'Incinerated'],
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
        id: 'wasteGeneration',
        label: 'Waste Generation (kg/unit)',
        type: 'number',
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'endOfLife',
        label: 'End-of-Life Treatment',
        type: 'dropdown',
        options: ['Recycling', 'Landfill', 'Incineration', 'Reuse'],
        value: '',
        completed: false,
        skipped: false
      }
    ];

    setInputs(freshInputs);
    setCurrentStep(0);
    setAnalysisComplete(false);
    setGraphNodes([]);
    setCurrentProject(null);
    setViewMode('edit');
    setSelectedNode(null);
    setCurrentNodeInfo(null);
  }, [projects]);

  // Handle graph nodes change and auto-reset if needed
  const handleGraphNodesChange = (newNodes: GraphNode[]) => {
    // Update graph nodes
    setGraphNodes(newNodes);
    
    // Auto-reset inputs only AFTER project is saved (not just when analysis is complete)
    if (isUserGraphUpdate && projectSaved && newNodes.length > 0) {
      // Reset inputs and start fresh
      setTimeout(() => {
        resetToFirstInput();
        setIsUserGraphUpdate(false); // Reset the flag
        setProjectSaved(false); // Reset the saved flag so it doesn't reset again
      }, 500); // Small delay to let the graph update complete
    }
  };

  // Check if all inputs are filled and prompt to save if needed
  const checkAndPromptSave = useCallback(() => {
    // Only prompt save when ALL inputs are completed with actual values (not skipped)
    const allInputsCompleted = inputs.every(input => input.completed && input.value.trim() !== '');
    if (allInputsCompleted && !analysisComplete && !showSaveProjectPrompt) {
      setShowSaveProjectPrompt(true);
    }
  }, [inputs, analysisComplete, showSaveProjectPrompt]);

  // Save project with name from product selection
  const saveProjectFromPrompt = () => {
    // Only save if all inputs are completed with actual values
    const allInputsCompleted = inputs.every(input => input.completed && input.value.trim() !== '');
    if (!allInputsCompleted) {
      console.warn('Cannot save project: Not all inputs are completed with values');
      setShowSaveProjectPrompt(false);
      return;
    }

    if (currentProject) {
      // Update existing project
      const updatedProject: Project = {
        ...currentProject,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'Completed',
        lcaData: {
          inputs: [...inputs],
          graphNodes: [...graphNodes],
          analysisComplete: true
        }
      };

      // Update the project in the projects list
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === currentProject.id ? updatedProject : project
        )
      );

      // Update current project reference
      setCurrentProject(updatedProject);
    } else {
      // Check if product selection matches an existing project
      const productSelection = getCurrentValue('product');
      const projectName = productSelection || 'LCA Analysis';
      
      // Extract product name and functional unit from selection
      const match = projectName.match(/^(.+?)\s*\((.+?)\)$/);
      const cleanName = match ? match[1] : projectName;
      const functionalUnit = match ? match[2] : '1 unit';
      
      // Look for existing project that matches the product selection
      const existingProject = projects.find(p => 
        `${p.name} (${p.functionalUnit})` === productSelection
      );
      
      if (existingProject) {
        // Update existing project with LCA data
        const updatedProject: Project = {
          ...existingProject,
          lastModified: new Date().toISOString().split('T')[0],
          status: 'Completed',
          lcaData: {
            inputs: [...inputs],
            graphNodes: [...graphNodes],
            analysisComplete: true
          }
        };

        // Update the project in the projects list
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === existingProject.id ? updatedProject : project
          )
        );

        // Set as current project
        setCurrentProject(updatedProject);
      } else {
        // Create new project only if no matching project found
        const newProjectId = `project_${Date.now()}`;
        
        const savedProject: Project = {
          id: newProjectId,
          name: cleanName,
          description: `LCA analysis for ${cleanName}`,
          functionalUnit: functionalUnit,
          createdDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          status: 'Completed',
          type: 'Other', // Default type, can be improved based on product selection
          lcaData: {
            inputs: [...inputs],
            graphNodes: [...graphNodes],
            analysisComplete: true
          }
        };

        // Add the project to the projects list
        setProjects(prevProjects => [...prevProjects, savedProject]);
        setCurrentProject(savedProject);
      }
    }
    
    setAnalysisComplete(true);
    setShowSaveProjectPrompt(false);
    
    // Show success notification
    setProjectSaved(true);
    setTimeout(() => setProjectSaved(false), 3000);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Reset optimizer graph view when switching tabs
  useEffect(() => {
    if (activeTab !== 'optimizer') {
      setOptimizerGraphView(false);
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    // Save current project progress before switching tabs
    if (activeTab === 'modeler') {
      saveCurrentProjectProgress();
    }
    
    // Reset to edit mode when switching to modeler tab from other tabs (for new analysis)
    if (tab === 'modeler' && activeTab !== 'modeler' && !currentProject) {
      setViewMode('edit');
    }
    
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
      
      // Add project to list
      setProjects([project, ...projects]);
      
      // Reset form
      setNewProject({ name: '', description: '', functionalUnit: '', type: 'Steel' });
      setShowCreateModal(false);
      
      // Automatically start working on the new project
      continueProject(project);
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
      
      // Reset graph and inputs immediately after update
      resetToFirstInput();
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

  // Handle showing missing values popup
  const handleShowMissingValuesPopup = (missing: LCAInput[]) => {
    setMissingInputs(missing);
    setShowMissingValuesPopup(true);
  };

  // Handle completion when all values are filled
  const handleComplete = () => {
    setAnalysisComplete(true);
    
    // Show save prompt instead of automatically saving
    setShowSaveProjectPrompt(true);
    
    // Trigger showing full graph view
    setTimeout(() => {
      // This will be handled by the graph component's auto-focus
    }, 500);
  };

  // Save current LCA analysis as a project
  // Initialize fresh inputs for a specific project
  const initializeInputsForProject = (project: Project): LCAInput[] => {
    return [
      {
        id: 'product',
        label: 'Product Selection',
        type: 'dropdown',
        options: [`${project.name} (${project.functionalUnit})`],
        value: `${project.name} (${project.functionalUnit})`,
        completed: true,
        skipped: false
      },
      {
        id: 'location',
        label: 'Factory Location',
        type: 'dropdown',
        options: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'],
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'rawMaterials',
        label: 'Raw Materials Source',
        type: 'dropdown',
        options: ['Primary extraction', 'Recycled materials', 'Bio-based materials', 'Mixed sources'],
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'electricity',
        label: 'Electricity Consumption (kWh)',
        type: 'number',
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'water',
        label: 'Water Usage (L)',
        type: 'number',
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'transportation',
        label: 'Transportation Mode',
        type: 'dropdown',
        options: ['Truck', 'Rail', 'Ship', 'Air', 'Pipeline'],
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'scrapRate',
        label: 'Material Scrap Rate (%)',
        type: 'number',
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'packaging',
        label: 'Packaging Material',
        type: 'dropdown',
        options: ['Cardboard', 'Plastic', 'Metal', 'Glass', 'Biodegradable'],
        value: '',
        completed: false,
        skipped: false
      },
      {
        id: 'endOfLife',
        label: 'End-of-Life Treatment',
        type: 'dropdown',
        options: ['Recycling', 'Landfill', 'Incineration', 'Reuse'],
        value: '',
        completed: false,
        skipped: false
      }
    ];
  };

  // Save current project's progress (even if incomplete)
  const saveCurrentProjectProgress = useCallback(() => {
    if (currentProject) {
      const updatedProjects = projects.map(project => {
        if (project.id === currentProject.id) {
          return {
            ...project,
            lastModified: new Date().toISOString().split('T')[0],
            lcaData: {
              inputs: [...inputs],
              graphNodes: [...graphNodes],
              analysisComplete: analysisComplete
            }
          };
        }
        return project;
      });
      setProjects(updatedProjects);
    }
  }, [currentProject, projects, inputs, graphNodes, analysisComplete]);

  // Open a saved completed project
  const openSavedProject = (project: Project) => {
    if (project.lcaData) {
      // Set as current project so back button can reload state properly
      setCurrentProject(project);
      
      // Set the analysis project and show the dedicated analysis view
      setAnalysisProject(project);
      setShowAnalysisView(true);
    }
  };

  // Continue working on a draft or active project
  const continueProject = (project: Project) => {
    // Save current project progress before switching
    saveCurrentProjectProgress();
    
    setCurrentProject(project);
    
    // Set view mode to 'edit' for draft/active projects
    setViewMode('edit');
    
    // If project has saved LCA data, load it
    if (project.lcaData) {
      // Prevent auto-reset and node regeneration when loading saved project
      setIsUserGraphUpdate(false);
      setIsLoadingSavedProject(true);
      
      setInputs(project.lcaData.inputs);
      setGraphNodes(project.lcaData.graphNodes);
      setAnalysisComplete(project.lcaData.analysisComplete);
      
      // Set current step to the first incomplete input
      const firstIncompleteIndex = project.lcaData.inputs.findIndex(input => !input.completed && !input.skipped);
      setCurrentStep(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
      
      // Reset the loading flag after a short delay to allow the graph to load
      setTimeout(() => {
        setIsLoadingSavedProject(false);
      }, 100);
    } else {
      // Initialize fresh inputs for this project type
      const freshInputs = initializeInputsForProject(project);
      setInputs(freshInputs);
      setGraphNodes([]);
      setCurrentStep(0);
      setAnalysisComplete(false);
    }
    
    // Switch to the modeler tab
    setActiveTab('modeler');
  };

  // Fill missing values with AI simulation
  const fillMissingValuesWithAI = async () => {
    setIsFillingMissingValues(true);
    
    // Simulate AI processing time and fill random appropriate values
    const updatedInputs = [...inputs];
    
    for (let i = 0; i < missingInputs.length; i++) {
      // Simulate AI thinking time (longer for more complex fields)
      const thinkingTime = missingInputs[i].type === 'number' ? 1200 : 800;
      await new Promise(resolve => setTimeout(resolve, thinkingTime));
      
      const missingInput = missingInputs[i];
      const inputIndex = updatedInputs.findIndex(inp => inp.id === missingInput.id);
      
      if (inputIndex !== -1) {
        let aiValue = '';
        
        // Generate appropriate AI values based on input type
        switch (missingInput.id) {
          case 'product':
            aiValue = updatedInputs[inputIndex].options?.[0] || 'Steel Production Analysis (1 ton)';
            break;
          case 'location':
            aiValue = 'India - Mumbai';
            break;
          case 'energy':
            aiValue = 'Mixed Grid';
            break;
          case 'electricity':
            aiValue = (Math.random() * 150 + 75).toFixed(1); // 75-225 kWh
            break;
          case 'scrapRate':
            aiValue = (Math.random() * 8 + 3).toFixed(1); // 3-11%
            break;
          case 'scrapFate':
            aiValue = 'Recycled Internally';
            break;
          case 'waterUsage':
            aiValue = (Math.random() * 200 + 150).toFixed(1); // 150-350 L
            break;
          case 'transport':
            aiValue = 'Truck';
            break;
          case 'packaging':
            aiValue = 'Cardboard';
            break;
          case 'endOfLife':
            aiValue = 'Recycling';
            break;
          default:
            if (missingInput.options && missingInput.options.length > 0) {
              aiValue = missingInput.options[Math.floor(Math.random() * missingInput.options.length)];
            } else {
              aiValue = 'AI Generated Value';
            }
        }
        
        updatedInputs[inputIndex] = {
          ...updatedInputs[inputIndex],
          value: aiValue,
          completed: true,
          skipped: false
        };
        
        setInputs([...updatedInputs]);
      }
    }
    
    // Final delay before completion
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsFillingMissingValues(false);
    setShowMissingValuesPopup(false);
    setAnalysisComplete(true);
    
    // Show save prompt instead of automatically saving
    setShowSaveProjectPrompt(true);
  };

  // Monitor inputs and check if all are filled to prompt save
  useEffect(() => {
    checkAndPromptSave();
  }, [inputs, analysisComplete, showSaveProjectPrompt, checkAndPromptSave]);

  // Auto-save project progress periodically while working
  useEffect(() => {
    if (currentProject && activeTab === 'modeler') {
      const autoSaveInterval = setInterval(() => {
        saveCurrentProjectProgress();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [currentProject, activeTab, inputs, graphNodes, analysisComplete, saveCurrentProjectProgress]);

  // Listen for reset inputs event from LifeCycleModeler component
  useEffect(() => {
    const handleResetInputs = () => {
      resetToFirstInput();
    };

    window.addEventListener('resetInputs', handleResetInputs);
    
    return () => {
      window.removeEventListener('resetInputs', handleResetInputs);
    };
  }, [resetToFirstInput]);

  // Listen for user graph update events to trigger auto-reset
  useEffect(() => {
    const handleUserGraphUpdate = () => {
      setIsUserGraphUpdate(true);
    };

    window.addEventListener('userGraphUpdate', handleUserGraphUpdate);
    
    return () => {
      window.removeEventListener('userGraphUpdate', handleUserGraphUpdate);
    };
  }, []);

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
          {/* Back Button */}
          {viewMode === 'view' ? (
            <button 
              onClick={() => setActiveTab('projects')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </button>
          ) : (
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          )}
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
        {/* Top Menu Button - Hidden when viewing AI optimizer graph */}
        {!optimizerGraphView && (
          <div className="fixed top-4 left-4 z-30">
            <button 
              onClick={toggleSidebar}
              className="cursor-pointer p-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-lg hover:from-gray-800/80 hover:to-gray-700/80 transition-all duration-300 shadow-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

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
                    className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full"
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
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(project.type)}`}>
                        {project.type}
                      </span>
                      {project.lcaData && (
                        <span className="px-2 py-1 rounded text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>LCA Data</span>
                        </span>
                      )}
                      {project.lcaData && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-900/30 text-blue-400 border border-blue-500/30 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            {project.lcaData.inputs.filter(input => input.completed).length}/
                            {project.lcaData.inputs.length} Complete
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Project Dates */}
                    <div className="space-y-2 text-sm text-gray-400 mb-4 flex-grow">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {project.createdDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Modified: {project.lastModified}</span>
                      </div>
                    </div>

                    {/* Action Button - Always present at bottom */}
                    <div className="mt-auto">
                      {project.status === 'Completed' && project.lcaData ? (
                        <button
                          onClick={() => openSavedProject(project)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span>Open Analysis</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => continueProject(project)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Continue</span>
                        </button>
                      )}
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
            <div className="fixed inset-0 pt-16 bg-black">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="h-[calc(100vh-64px)] flex overflow-hidden pl-4 pr-8"
                style={{ 
                  minWidth: '1200px',
                  transform: 'scale(min(1, calc(100vw / 1200px)))',
                  transformOrigin: 'top left'
                }}
              >
                {/* Left Panel - Input Forms (Edit Mode) or Project Details (View Mode) */}
                {viewMode === 'edit' ? (
                  <div className="w-[32rem] min-w-[28rem] max-w-[36rem] bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-r border-gray-700/30 p-3 sm:p-4 overflow-y-auto ml-20 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-purple-500/50 hover:scrollbar-thumb-purple-400/60">
                    <LifeCycleModeler 
                      inputs={inputs}
                      setInputs={setInputs}
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      onShowMissingValuesPopup={handleShowMissingValuesPopup}
                      onComplete={handleComplete}
                      onInputChange={checkAndPromptSave}
                      readOnly={false}
                      viewMode={viewMode}
                      currentProject={currentProject}
                    />
                  </div>
                ) : (
                  <div className="w-[32rem] min-w-[28rem] max-w-[36rem] bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-r border-gray-700/30 p-3 sm:p-4 overflow-y-auto ml-20 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-purple-500/50 hover:scrollbar-thumb-purple-400/60">
                    {/* Project Details Panel */}
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Project Details</h2>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to start a new analysis? This will clear all current inputs and reset to the beginning.')) {
                                resetToFirstInput();
                              }
                            }}
                            className="bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center space-x-2 border border-red-500/30 hover:border-red-400/50"
                            title="Start new analysis from beginning"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Start Over</span>
                          </button>
                          <button
                            onClick={() => {
                              setViewMode('edit');
                              // Reset to continue editing if needed
                              if (currentProject) {
                                continueProject(currentProject);
                              }
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>

                      {/* Project Info */}
                      {currentProject && (
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-600/30 rounded-lg p-4 space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{currentProject.name}</h3>
                            <p className="text-gray-400 text-sm">{currentProject.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Functional Unit:</span>
                              <p className="text-white font-medium">{currentProject.functionalUnit}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <p className="text-white font-medium">{currentProject.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(currentProject.status)}`}>
                                {currentProject.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Last Modified:</span>
                              <p className="text-white font-medium">{currentProject.lastModified}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Analysis Summary */}
                      {currentProject?.lcaData && (
                        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-green-400" />
                            <span>Analysis Summary</span>
                          </h4>
                          
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Inputs Completed:</span>
                              <span className="text-white font-medium">
                                {currentProject.lcaData.inputs.filter(input => input.completed).length}/
                                {currentProject.lcaData.inputs.length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Graph Nodes:</span>
                              <span className="text-white font-medium">{graphNodes.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Analysis Status:</span>
                              <span className={`px-2 py-1 rounded text-xs ${analysisComplete ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {analysisComplete ? 'Complete' : 'In Progress'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                          <Info className="w-5 h-5 text-blue-400" />
                          <span>View Mode</span>
                        </h4>
                        <p className="text-gray-400 text-sm">
                          You&apos;re viewing a completed project. Click on any node in the graph to see its details. 
                          Use the Edit button above to make changes to this project.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Center Panel - Graph Visualization (Stable width) */}
                <div 
                  className={`transition-all duration-300 ease-in-out bg-gradient-to-br from-gray-900/30 to-gray-800/20 p-4 overflow-hidden min-w-96 ${
                    selectedNode ? 'w-[calc(100%-59rem)]' : 'w-[calc(100%-35rem)]'
                  }`}
                >
                  <ObsidianGraph 
                    inputs={inputs} 
                    currentStep={currentStep}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    autoFocusOnMount={true}
                    analysisComplete={analysisComplete}
                    initialNodes={graphNodes}
                    onNodesChange={handleGraphNodesChange}
                    onNodeInfoUpdate={setCurrentNodeInfo}
                    isLoadingSavedProject={isLoadingSavedProject}
                  />
                </div>

                {/* Right Panel - Node Information Card (Sliding) */}
                <div className={`transition-all duration-300 ease-in-out bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-l border-gray-700/30 overflow-hidden ${
                  selectedNode ? 'w-96 opacity-100' : 'w-0 opacity-0'
                }`}>
                {selectedNode && (
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 p-6 border-b border-gray-700/30">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Node Information</h3>
                        <button
                          onClick={() => setSelectedNode(null)}
                          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {currentNodeInfo && (
                          <>
                            {/* Node Header */}
                            <div className="pb-4 border-b border-gray-700/50">
                              <h3 className="text-2xl font-bold text-white mb-3">{currentNodeInfo.title}</h3>
                              <p className="text-gray-300 text-sm leading-relaxed">{currentNodeInfo.description}</p>
                            </div>

                            {/* Resources Depleted/Used */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                                Resources Used/Depleted
                              </h4>
                              <div className="space-y-3">
                                {currentNodeInfo.resourcesDepletedOrUsed.map((resource: NodeResource, index: number) => (
                                  <div 
                                    key={index} 
                                    className={`p-4 rounded-xl border ${
                                      resource.impact === 'high' ? 'border-red-500/30 bg-red-500/10' :
                                      resource.impact === 'medium' ? 'border-yellow-500/30 bg-yellow-500/10' :
                                      'border-green-500/30 bg-green-500/10'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{resource.resource}</span>
                                      </div>
                                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                        resource.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                                        resource.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                        'bg-green-500/20 text-green-300'
                                      }`}>
                                        {resource.impact}
                                      </span>
                                    </div>
                                    <p className="text-gray-300 text-sm">{resource.amount}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Environmental Impact */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                                <span>🌍</span> Environmental Impact
                              </h4>
                              <div className="space-y-3">
                                {currentNodeInfo.environmentalImpact.map((impact: NodeImpact, index: number) => (
                                  <div 
                                    key={index} 
                                    className={`p-4 rounded-xl border ${
                                      impact.level === 'high' ? 'border-red-500/30 bg-red-500/10' :
                                      impact.level === 'medium' ? 'border-yellow-500/30 bg-yellow-500/10' :
                                      'border-green-500/30 bg-green-500/10'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="font-medium text-white">{impact.category}</span>
                                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                        impact.level === 'high' ? 'bg-red-500/20 text-red-300' :
                                        impact.level === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                        'bg-green-500/20 text-green-300'
                                      }`}>
                                        {impact.level}
                                      </span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{impact.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Recommendations */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                                <span>💡</span> Recommendations
                              </h4>
                              <div className="space-y-3">
                                {currentNodeInfo.recommendations.map((recommendation: string, index: number) => (
                                  <div key={index} className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                    <p className="text-green-200 text-sm leading-relaxed">{recommendation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Current Values */}
                            {selectedNode && selectedNode.id !== 'product' && selectedNode.id !== 'location' && (
                              <div className="pt-4 border-t border-gray-700/50">
                                <h4 className="text-lg font-semibold text-cyan-300 mb-4">Current Value</h4>
                                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-cyan-200 font-medium">Input Value:</span>
                                    <span className="font-mono text-white bg-gray-800/50 px-3 py-1 rounded-lg">
                                      {getCurrentValue(selectedNode.id) || 'Not set'}
                                    </span>
                                  </div>
                                  {selectedNode.status === 'filled' && (
                                    <p className="text-green-300 text-sm">✓ Data provided</p>
                                  )}
                                  {selectedNode.status === 'skipped' && (
                                    <p className="text-yellow-300 text-sm">⚠ Skipped</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </div>
          )}

          {activeTab === 'optimizer' && (
            <AIOptimizerPanel 
              projects={projects} 
              onGraphViewChange={setOptimizerGraphView}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAndExports 
              projects={projects}
            />
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 p-6">
              <BasicSettingsPanel />
            </div>
          )}

          {activeTab === 'user' && (
            <UserManagementPanel />
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

      {/* Save Project Prompt */}
      {showSaveProjectPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Analysis Complete!</h2>
              <p className="text-gray-300 leading-relaxed">
                {(() => {
                  const matchInfo = getProjectMatchInfo();
                  return matchInfo.isExistingProject 
                    ? `This analysis will be added to your existing project "${matchInfo.project?.name}".`
                    : "All inputs have been filled. Would you like to save this analysis as a project?";
                })()}
              </p>
            </div>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-600/30">
              <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center">
                <FolderOpen className="w-4 h-4 mr-2 text-green-400" />
                {(() => {
                  const matchInfo = getProjectMatchInfo();
                  return matchInfo.isExistingProject ? "Updating Project:" : "Project Details:";
                })()}
              </h3>
              <div className="text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="text-green-400 font-medium">
                    {(() => {
                      const matchInfo = getProjectMatchInfo();
                      const match = (matchInfo.productSelection || 'LCA Analysis').match(/^(.+?)\s*\((.+?)\)$/);
                      return match ? match[1] : (matchInfo.productSelection || 'LCA Analysis');
                    })()}
                  </span>
                </div>
                {(() => {
                  const matchInfo = getProjectMatchInfo();
                  if (matchInfo.isExistingProject && matchInfo.project) {
                    return (
                      <>
                        <div className="flex justify-between mt-1">
                          <span>Status:</span>
                          <span className="text-blue-400 font-medium">Will be updated</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Created:</span>
                          <span className="text-gray-400">{matchInfo.project.createdDate}</span>
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowSaveProjectPrompt(false);
                  setAnalysisComplete(true); // Allow user to continue without saving
                }}
                className="flex-1 bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
              >
                Continue Without Saving
              </button>
              <button
                onClick={saveProjectFromPrompt}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
              >
                <FolderOpen className="w-4 h-4" />
                <span>
                  {(() => {
                    const matchInfo = getProjectMatchInfo();
                    return matchInfo.isExistingProject ? "Update Project" : "Save Project";
                  })()}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Missing Values Popup */}
      {showMissingValuesPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Missing Values Detected</h2>
            </div>
            
            <p className="text-gray-300 mb-4 text-center leading-relaxed text-sm">
              We found <span className="text-purple-400 font-semibold">{missingInputs.length} incomplete values</span> in your analysis. 
              Our AI can intelligently fill these with industry-standard estimates based on your existing inputs.
            </p>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-gray-600/30">
              <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Incomplete Fields:
              </h3>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {missingInputs.map((input, index) => (
                  <li key={index} className="flex items-center text-xs text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${
                      input.skipped ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="flex-1">{input.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded text-white ${
                      input.skipped ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {input.skipped ? 'Skipped' : 'Missing'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {isFillingMissingValues ? (
              <div className="text-center py-4">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 border-3 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-3 border-t-purple-500 border-r-purple-400 rounded-full animate-spin"></div>
                  
                  {/* Inner pulsing core */}
                  <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 bg-white rounded-full animate-ping"></div>
                  
                  {/* AI Brain Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="text-lg font-semibold text-white mb-2 flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-base">AI Processing...</span>
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  Analyzing your inputs and generating optimal values
                </div>
                
                {/* Progress indicator */}
                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                
                {/* Animated dots */}
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                
                {/* AI Messages */}
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <div className="animate-pulse">• Analyzing material properties...</div>
                  <div className="animate-pulse" style={{ animationDelay: '0.5s' }}>• Calculating environmental impacts...</div>
                  <div className="animate-pulse" style={{ animationDelay: '1s' }}>• Optimizing resource allocation...</div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowMissingValuesPopup(false)}
                  className="flex-1 bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                >
                  Fill Manually
                </button>
                <button
                  onClick={fillMissingValuesWithAI}
                  className="flex-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Fill with AI</span>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Project Saved Notification */}
      {projectSaved && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Project saved successfully!</span>
        </motion.div>
      )}

      {/* Dedicated Analysis View */}
      {showAnalysisView && analysisProject && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header with Back Button */}
          <div className="bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-xl border-b border-gray-700/50 p-4 flex-shrink-0 h-20">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    // If returning to the same project, reload its state into the modeler
                    if (analysisProject && currentProject?.id === analysisProject.id && analysisProject.lcaData) {
                      // Reload the project data into the modeler state
                      setIsUserGraphUpdate(false);
                      setIsLoadingSavedProject(true);
                      
                      setInputs(analysisProject.lcaData.inputs);
                      setGraphNodes(analysisProject.lcaData.graphNodes);
                      setAnalysisComplete(analysisProject.lcaData.analysisComplete);
                      
                      // Set current step to the first incomplete input
                      const firstIncompleteIndex = analysisProject.lcaData.inputs.findIndex(input => !input.completed && !input.skipped);
                      setCurrentStep(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
                      
                      // Reset the loading flag after a short delay
                      setTimeout(() => {
                        setIsLoadingSavedProject(false);
                      }, 100);
                    }
                    
                    setShowAnalysisView(false);
                    setAnalysisProject(null);
                  }}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Projects</span>
                </button>
                <div className="h-6 w-px bg-gray-600"></div>
                <div>
                  <h1 className="text-xl font-bold text-white">{analysisProject.name}</h1>
                  <p className="text-sm text-gray-400">{analysisProject.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs bg-green-900/30 text-green-400 border border-green-500/30">
                  {analysisProject.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-blue-900/30 text-blue-400 border border-blue-500/30">
                  {analysisProject.type}
                </span>
              </div>
            </div>
          </div>

          {/* Analysis Content */}
          <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">
            <div className="flex w-full h-full">
              {/* Project Info Panel */}
              <div className="w-80 flex-shrink-0 bg-gray-900/30 border-r border-gray-700/30 p-4 overflow-y-auto">
                {/* Project Details */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-4 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-400" />
                    Project Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Functional Unit:</span>
                      <div className="text-white font-medium">{analysisProject.functionalUnit}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <div className="text-white">{analysisProject.createdDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Modified:</span>
                      <div className="text-white">{analysisProject.lastModified}</div>
                    </div>
                    {analysisProject.lcaData && (
                      <div>
                        <span className="text-gray-400">Completion:</span>
                        <div className="text-white">
                          {analysisProject.lcaData.inputs.filter(input => input.completed).length}/
                          {analysisProject.lcaData.inputs.length} inputs completed
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Summary */}
                {analysisProject.lcaData && (
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-400" />
                      Input Summary
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {analysisProject.lcaData.inputs.map((input) => (
                        <div key={input.id} className="p-2 bg-gray-800/30 rounded-lg border border-gray-600/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-300">{input.label}</span>
                            <div className="flex items-center space-x-1">
                              {input.completed ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : input.skipped ? (
                                <Circle className="w-3 h-3 text-yellow-400" />
                              ) : (
                                <Circle className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {input.value || (input.skipped ? 'Skipped' : 'Not completed')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LCA Graph */}
              <div className={`transition-all duration-300 ease-in-out flex flex-col p-4 ${
                analysisSelectedNode ? 'w-[calc(100%-384px)]' : 'w-full'
              }`}>
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-xl p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                      Life Cycle Assessment Graph
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {analysisProject.lcaData?.inputs?.filter(input => input.completed).length || 0} completed nodes
                      </span>
                    </div>
                  </div>
                  
                  {/* Graph Container */}
                  <div className="relative flex-1 min-h-0 bg-black/20 rounded-lg border border-gray-600/30 overflow-hidden">
                    {analysisProject.lcaData?.inputs && analysisProject.lcaData.inputs.length > 0 ? (
                      <ObsidianGraph
                        inputs={analysisProject.lcaData.inputs}
                        currentStep={0}
                        selectedNode={analysisSelectedNode ? analysisProject.lcaData.graphNodes?.find(node => node.id === analysisSelectedNode) || null : null}
                        setSelectedNode={(node) => setAnalysisSelectedNode(node?.id || null)}
                        autoFocusOnMount={true}
                        analysisComplete={true}
                        initialNodes={undefined} // Let ObsidianGraph regenerate nodes from inputs
                        onNodesChange={() => {}} // Read-only view
                        onNodeInfoUpdate={() => {}} // Read-only view
                        isLoadingSavedProject={false}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-400 mb-2">No Graph Data</h4>
                          <p className="text-gray-500">This analysis doesn&apos;t contain graph data</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Node Information Card (Sliding) */}
              <div className={`transition-all duration-300 ease-in-out bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-l border-gray-700/30 overflow-hidden ${
                analysisSelectedNode ? 'w-96 opacity-100' : 'w-0 opacity-0'
              }`}>
                {analysisSelectedNode && (() => {
                  const getNodeInfo = (nodeId: string): NodeInfo | null => {
                    if (!analysisProject.lcaData?.inputs) return null;
                    
                    const getCurrentValue = (inputId: string): string => {
                      const input = analysisProject.lcaData?.inputs.find(inp => inp.id === inputId);
                      return input?.value || '';
                    };

                    // Find the node object from the saved graph nodes
                    const node = analysisProject.lcaData.graphNodes?.find(n => n.id === nodeId);
                    if (!node) return null;

                    const nodeInfo: NodeInfo = {
                      title: node.label,
                      description: '',
                      resourcesDepletedOrUsed: [],
                      environmentalImpact: [],
                      recommendations: []
                    };

                    switch (node.id) {
                      case 'product':
                        nodeInfo.description = 'The product definition stage sets the foundation for your entire LCA. This determines the functional unit and system boundaries.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Administrative Energy', amount: 'Minimal', impact: 'low', icon: '⚡' },
                          { resource: 'Digital Storage', amount: '~1 MB', impact: 'low', icon: '💾' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Carbon Footprint', level: 'low', description: 'Minimal emissions from digital activities' }
                        ];
                        nodeInfo.recommendations = ['Define clear functional units', 'Set appropriate system boundaries'];
                        break;

                      case 'location':
                        nodeInfo.description = 'Geographic location significantly affects energy grid composition, transportation distances, and regulatory frameworks.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Land Use', amount: 'Varies by facility size', impact: 'medium', icon: '🏭' },
                          { resource: 'Local Infrastructure', amount: 'Shared usage', impact: 'low', icon: '🛣️' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Carbon Intensity', level: 'high', description: 'Varies by local energy grid (coal vs renewable)' },
                          { category: 'Transportation Emissions', level: 'medium', description: 'Distance to suppliers and markets' }
                        ];
                        nodeInfo.recommendations = ['Choose locations with clean energy grids', 'Minimize transportation distances'];
                        break;

                      case 'energy':
                        nodeInfo.description = 'Energy source selection is critical for environmental impact. Renewable sources dramatically reduce lifecycle emissions.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Fossil Fuels', amount: 'High (if non-renewable)', impact: 'high', icon: '🛢️' },
                          { resource: 'Renewable Resources', amount: 'Sustainable (if renewable)', impact: 'low', icon: '🌱' },
                          { resource: 'Grid Infrastructure', amount: 'Shared usage', impact: 'medium', icon: '🔌' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'GHG Emissions', level: 'high', description: 'Major contributor to carbon footprint' },
                          { category: 'Air Quality', level: 'high', description: 'Fossil fuels create pollutants' },
                          { category: 'Resource Depletion', level: 'high', description: 'Non-renewable energy sources' }
                        ];
                        nodeInfo.recommendations = ['Prioritize renewable energy sources', 'Implement energy efficiency measures', 'Consider on-site solar/wind'];
                        break;

                      case 'electricity':
                        nodeInfo.description = 'Electricity consumption directly correlates with environmental impact based on the local energy grid composition.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Coal/Gas', amount: `${getCurrentValue('electricity') || '0'} kWh × grid factor`, impact: 'high', icon: '⚡' },
                          { resource: 'Water (cooling)', amount: '~2-3L per kWh', impact: 'medium', icon: '💧' },
                          { resource: 'Grid Capacity', amount: 'Shared infrastructure', impact: 'low', icon: '🔌' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Carbon Emissions', level: 'high', description: `${getCurrentValue('electricity') || '0'} kWh generates significant CO₂` },
                          { category: 'Water Consumption', level: 'medium', description: 'Thermoelectric power plants require cooling water' }
                        ];
                        nodeInfo.recommendations = ['Reduce electricity consumption', 'Use energy-efficient equipment', 'Source from renewable grids'];
                        break;

                      case 'scrapRate':
                        nodeInfo.description = 'Material waste during production represents lost resources and additional environmental burden.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Raw Materials', amount: `${getCurrentValue('scrapRate') || '0'}% waste`, impact: 'medium', icon: '🔨' },
                          { resource: 'Processing Energy', amount: 'Wasted on scrapped material', impact: 'medium', icon: '⚡' },
                          { resource: 'Landfill Space', amount: 'If not recycled', impact: 'medium', icon: '🗑️' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Resource Efficiency', level: 'medium', description: 'Higher scrap rates mean more resource consumption' },
                          { category: 'Waste Generation', level: 'medium', description: 'Increases overall material throughput' }
                        ];
                        nodeInfo.recommendations = ['Optimize manufacturing processes', 'Implement quality control', 'Design for manufacturability'];
                        break;

                      case 'scrapFate':
                        nodeInfo.description = 'The destination of scrap material significantly affects the overall environmental impact of the production process.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Recycling Energy', amount: 'If recycled', impact: 'low', icon: '♻️' },
                          { resource: 'Landfill Space', amount: 'If disposed', impact: 'high', icon: '🗑️' },
                          { resource: 'Transportation Fuel', amount: 'To recycling/disposal', impact: 'low', icon: '🚛' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Circular Economy', level: 'high', description: 'Recycling reduces virgin material demand' },
                          { category: 'Waste Impact', level: 'high', description: 'Landfilling creates long-term environmental burden' }
                        ];
                        nodeInfo.recommendations = ['Maximize recycling rates', 'Partner with certified recyclers', 'Design for recyclability'];
                        break;

                      case 'waterUsage':
                      case 'water':
                        nodeInfo.description = 'Water consumption affects local water resources and requires treatment, impacting aquatic ecosystems.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Freshwater', amount: `${getCurrentValue('waterUsage') || getCurrentValue('water') || '0'} L per unit`, impact: 'high', icon: '💧' },
                          { resource: 'Treatment Chemicals', amount: 'For water purification', impact: 'medium', icon: '🧪' },
                          { resource: 'Energy (pumping/treatment)', amount: '~3-4 kWh per 1000L', impact: 'medium', icon: '⚡' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Water Scarcity', level: 'high', description: 'Depletes local freshwater resources' },
                          { category: 'Aquatic Ecosystems', level: 'medium', description: 'Affects water availability for ecosystems' },
                          { category: 'Treatment Impact', level: 'medium', description: 'Wastewater requires energy-intensive treatment' }
                        ];
                        nodeInfo.recommendations = ['Implement water recycling', 'Use water-efficient processes', 'Consider rainwater harvesting'];
                        break;

                      case 'transport':
                      case 'transportation':
                        nodeInfo.description = 'Transportation mode significantly affects fuel consumption, emissions, and delivery timeframes.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Fossil Fuels', amount: 'Varies by mode and distance', impact: 'high', icon: '⛽' },
                          { resource: 'Vehicle Infrastructure', amount: 'Shared transportation network', impact: 'medium', icon: '🛣️' },
                          { resource: 'Packaging Materials', amount: 'Protection during transport', impact: 'low', icon: '📦' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'GHG Emissions', level: 'high', description: 'Major source of scope 3 emissions' },
                          { category: 'Air Pollution', level: 'high', description: 'NOx, particulates from combustion' },
                          { category: 'Noise Pollution', level: 'medium', description: 'Traffic noise in urban areas' }
                        ];
                        nodeInfo.recommendations = ['Choose efficient transportation modes', 'Optimize logistics and routing', 'Consider rail/sea over road/air'];
                        break;

                      case 'packaging':
                        nodeInfo.description = 'Packaging materials protect products during transport but add to environmental burden through material use and disposal.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Packaging Materials', amount: `${getCurrentValue('packaging')} based packaging`, impact: 'medium', icon: '📦' },
                          { resource: 'Manufacturing Energy', amount: 'For packaging production', impact: 'medium', icon: '⚡' },
                          { resource: 'Transport Fuel', amount: 'Additional weight/volume', impact: 'low', icon: '🚛' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Material Consumption', level: 'medium', description: 'Additional raw materials required' },
                          { category: 'Waste Generation', level: 'medium', description: 'Packaging becomes waste after use' },
                          { category: 'Recyclability', level: 'medium', description: 'Impact depends on material choice' }
                        ];
                        nodeInfo.recommendations = ['Use minimal packaging', 'Choose recyclable materials', 'Optimize packaging design'];
                        break;

                      case 'endOfLife':
                        const endOfLifeValue = getCurrentValue('endOfLife');
                        nodeInfo.description = 'End-of-life treatment determines whether materials re-enter the economy or become waste, affecting long-term sustainability.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Recycling Infrastructure', amount: 'If recyclable design', impact: 'low', icon: '♻️' },
                          { resource: 'Landfill Space', amount: 'If not recyclable', impact: 'high', icon: '🗑️' },
                          { resource: 'Incineration Energy', amount: 'Energy recovery possible', impact: 'medium', icon: '🔥' }
                        ];
                        nodeInfo.environmentalImpact = endOfLifeValue === 'Recycling' ? [
                          { category: 'Circular Economy', level: 'low', description: 'Materials re-enter production cycle' },
                          { category: 'Resource Recovery', level: 'low', description: 'Reduces need for virgin materials' },
                          { category: 'Energy Savings', level: 'low', description: 'Recycling typically uses less energy than production' }
                        ] : endOfLifeValue === 'Landfill' ? [
                          { category: 'Long-term Pollution', level: 'high', description: 'Materials may leach toxins over time' },
                          { category: 'Land Use', level: 'high', description: 'Permanent allocation of land for waste' },
                          { category: 'Resource Loss', level: 'high', description: 'Materials permanently removed from economy' }
                        ] : [
                          { category: 'Air Emissions', level: 'medium', description: 'Combustion creates emissions' },
                          { category: 'Energy Recovery', level: 'medium', description: 'Can generate electricity from waste' },
                          { category: 'Ash Disposal', level: 'medium', description: 'Remaining ash requires management' }
                        ];
                        nodeInfo.recommendations = endOfLifeValue === 'Recycling' ? [
                          'Design for disassembly',
                          'Use recyclable materials',
                          'Establish take-back programs',
                          'Partner with certified recyclers'
                        ] : [
                          'Prioritize recycling over disposal',
                          'Design for disassembly',
                          'Use recyclable materials',
                          'Implement take-back programs'
                        ];
                        break;

                      default:
                        nodeInfo.description = 'This process step contributes to the overall environmental impact of your product lifecycle.';
                        nodeInfo.resourcesDepletedOrUsed = [
                          { resource: 'Various Resources', amount: 'Context dependent', impact: 'medium', icon: '🔄' }
                        ];
                        nodeInfo.environmentalImpact = [
                          { category: 'Environmental Impact', level: 'medium', description: 'Specific impacts depend on process details' }
                        ];
                        nodeInfo.recommendations = ['Define specific process parameters', 'Quantify resource usage'];
                    }

                    return nodeInfo;
                  };

                  const currentNodeInfo = getNodeInfo(analysisSelectedNode);

                  return (
                    <div className="h-full flex flex-col overflow-hidden">
                      {/* Fixed Header */}
                      <div className="flex-shrink-0 p-6 border-b border-gray-700/30">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-white">Node Information</h3>
                          <button
                            onClick={() => setAnalysisSelectedNode(null)}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto p-6">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          {currentNodeInfo && (
                            <>
                              {/* Node Header */}
                              <div className="pb-4 border-b border-gray-700/50">
                                <h3 className="text-2xl font-bold text-white mb-3">{currentNodeInfo.title}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">{currentNodeInfo.description}</p>
                              </div>

                              {/* Resources Depleted/Used */}
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                                  Resources Used/Depleted
                                </h4>
                                <div className="space-y-3">
                                  {currentNodeInfo.resourcesDepletedOrUsed.map((resource: NodeResource, index: number) => (
                                    <div 
                                      key={index} 
                                      className={`p-4 rounded-xl border ${
                                        resource.impact === 'high' ? 'border-red-500/30 bg-red-500/10' :
                                        resource.impact === 'medium' ? 'border-yellow-500/30 bg-yellow-500/10' :
                                        'border-green-500/30 bg-green-500/10'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{resource.icon}</span>
                                          <span className="font-medium text-white">{resource.resource}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                          resource.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                                          resource.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                          'bg-green-500/20 text-green-300'
                                        }`}>
                                          {resource.impact}
                                        </span>
                                      </div>
                                      <p className="text-gray-300 text-sm">{resource.amount}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Environmental Impact */}
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                                  <span>🌍</span> Environmental Impact
                                </h4>
                                <div className="space-y-3">
                                  {currentNodeInfo.environmentalImpact.map((impact: NodeImpact, index: number) => (
                                    <div 
                                      key={index} 
                                      className={`p-4 rounded-xl border ${
                                        impact.level === 'high' ? 'border-red-500/30 bg-red-500/10' :
                                        impact.level === 'medium' ? 'border-yellow-500/30 bg-yellow-500/10' :
                                        'border-green-500/30 bg-green-500/10'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-white">{impact.category}</span>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                          impact.level === 'high' ? 'bg-red-500/20 text-red-300' :
                                          impact.level === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                          'bg-green-500/20 text-green-300'
                                        }`}>
                                          {impact.level}
                                        </span>
                                      </div>
                                      <p className="text-gray-300 text-sm">{impact.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Sustainability Recommendations */}
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                                  <span>💡</span> Sustainability Recommendations
                                </h4>
                                <div className="space-y-2">
                                  {currentNodeInfo.recommendations.map((recommendation: string, index: number) => (
                                    <div 
                                      key={index} 
                                      className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3"
                                    >
                                      <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                                        <span className="text-green-400 text-xs font-bold">{index + 1}</span>
                                      </div>
                                      <p className="text-gray-300 text-sm leading-relaxed">{recommendation}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
