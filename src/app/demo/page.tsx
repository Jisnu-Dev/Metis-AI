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
  lcaData?: {
    inputs: LCAInput[];
    graphNodes: GraphNode[];
    analysisComplete: boolean;
  };
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
  onInputChange
}: { 
  inputs: LCAInput[];
  setInputs: React.Dispatch<React.SetStateAction<LCAInput[]>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onShowMissingValuesPopup: (missingInputs: LCAInput[]) => void;
  onComplete: () => void;
  onInputChange?: () => void;
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

    // Check for missing values across ALL inputs (not completed and not skipped)
    const missingInputs = updatedInputs.filter(input => !input.completed && !input.skipped);
    
    // Always show popup if there are ANY missing values
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Streamlined Header Section */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Life Cycle Modeler</h2>
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

          <div className="relative z-10 h-full p-6 flex flex-col">
            
            {/* Header with Title & Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{currentInput.label}</h3>
                    <div className="text-sm text-gray-400 mt-1">Step {currentStep + 1} of {inputs.length}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(((inputs.filter(i => i.completed).length) / inputs.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Complete</div>
                </div>
              </div>
              
              {/* Step Description */}
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(currentInput.id)}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {getStepDescription(currentInput.id)}
                  </p>
                </div>
              </div>
            </div>

            {/* Your Input Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wide">
                Your Input
              </label>
              
              {currentInput.type === 'dropdown' && (
                <div className="relative">
                  <select
                    value={currentInput.value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-2 border-gray-600/40 focus:border-purple-500/60 hover:border-purple-400/40 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm"
                  >
                    <option value="" className="bg-gray-800">Choose an option...</option>
                    {currentInput.options?.map((option, index) => (
                      <option key={index} value={option} className="bg-gray-800">{option}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-2 border-gray-600/40 focus:border-purple-500/60 hover:border-purple-400/40 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 placeholder-gray-400 text-sm"
                    placeholder={getPlaceholder(currentInput.id)}
                  />
                  {currentInput.type === 'number' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 text-sm font-medium bg-purple-500/20 px-3 py-1 rounded-lg">
                      {getUnit(currentInput.id)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Status & Tips */}
            <div className="mb-6">
              {currentInput.value ? (
                <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-green-400 text-sm font-medium">Input Received</div>
                    <div className="text-green-300/80 text-sm">Ready to proceed</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-blue-400 text-sm font-medium">Awaiting Input</div>
                    <div className="text-blue-300/80 text-sm">Enter data above</div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Progress Section */}
            <div className="mb-6 flex-1">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200">Overall Progress</span>
                  </div>
                  <div className="text-sm text-purple-400 font-semibold">
                    {inputs.filter(i => i.completed).length} / {inputs.length}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-700/60 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative"
                      style={{ width: `${(inputs.filter(i => i.completed).length / inputs.length) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Progress milestones */}
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
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
            <div className="flex items-center justify-between space-x-3 flex-shrink-0">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="group flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-700/80 to-gray-600/80 hover:from-gray-600/80 hover:to-gray-500/80 disabled:from-gray-800/50 disabled:to-gray-800/50 disabled:text-gray-500 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed border border-gray-500/30 hover:border-gray-400/50 disabled:border-gray-700/30 text-sm font-medium"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              
              <button
                onClick={handleSkip}
                className="group flex items-center space-x-2 px-4 py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 rounded-xl transition-all duration-300 font-medium text-sm"
              >
                <Circle className="w-4 h-4" />
                <span>Skip</span>
              </button>
              
              {currentStep === inputs.length - 1 ? (
                <button
                  onClick={handleComplete}
                  className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 text-sm"
                >
                  <span>Complete Analysis</span>
                  <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 text-sm"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
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
  autoFocusOnMount = false,
  analysisComplete = false,
  initialNodes,
  onNodesChange,
  onNodeInfoUpdate
}: { 
  inputs: LCAInput[], 
  currentStep: number,
  selectedNode: GraphNode | null,
  setSelectedNode: (node: GraphNode | null) => void,
  autoFocusOnMount?: boolean,
  analysisComplete?: boolean,
  initialNodes?: GraphNode[],
  onNodesChange?: (nodes: GraphNode[]) => void,
  onNodeInfoUpdate?: (nodeInfo: NodeInfo | null) => void
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
  const getCurrentValue = (inputId: string) => {
    const input = inputs.find(inp => inp.id === inputId);
    return input?.value || '';
  };

  // Get detailed node information including resource depletion
  const getNodeInfo = (node: GraphNode): NodeInfo => {
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
  };

  // Update parent with current node info when selectedNode changes
  useEffect(() => {
    if (onNodeInfoUpdate) {
      if (selectedNode) {
        onNodeInfoUpdate(getNodeInfo(selectedNode));
      } else {
        onNodeInfoUpdate(null);
      }
    }
  }, [selectedNode, onNodeInfoUpdate]);

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
    const canvasWidth = canvas.width / window.devicePixelRatio;
    const canvasHeight = canvas.height / window.devicePixelRatio;
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
      
      // Focus specifically on the NEW node when a new node is added
      if (updatedNodes.length > previousNodeCount && updatedNodes.length > 0) {
        const newNodeIndex = updatedNodes.length - 1; // The newest node
        const newNode = updatedNodes[newNodeIndex];
        
        if (newNode) {
          setAutoFocusEnabled(true); // Enable auto-focus for new nodes
          setTimeout(() => {
            // Focus specifically on the new node with a good zoom level
            const focusZoom = Math.max(userPreferredZoom, 1.5); // Ensure good zoom for new node
            focusOnNode(newNode.x, newNode.y, focusZoom);
          }, 200); // Small delay to ensure node is rendered
        }
      }
      
      // Notify parent that nodes have changed due to input updates (not dragging)
      shouldNotifyParent.current = true;
      
      return updatedNodes;
    });
  }, [inputs, currentStep, userPreferredZoom, generateNodes, focusOnNode]);

  // Handle initialNodes updates (for loading saved projects)
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes]);

  // Track if we should notify parent (to prevent infinite loops during internal changes)
  const shouldNotifyParent = useRef(false);

  // Notify parent when nodes change (for saving projects) - but only when explicitly requested
  useEffect(() => {
    if (onNodesChange && shouldNotifyParent.current) {
      onNodesChange(nodes);
      shouldNotifyParent.current = false;
    }
  }, [nodes, onNodesChange]);

  // Auto-focus to overview when component mounts (when modeler tab is opened)
  useEffect(() => {
    if (autoFocusOnMount && nodes.length > 0) {
      const timer = setTimeout(() => {
        resetToOverview();
      }, 500); // Delay to ensure canvas is ready and nodes are rendered
      
      return () => clearTimeout(timer);
    }
  }, [autoFocusOnMount, resetToOverview, nodes.length]);

  // Auto-focus to overview when analysis is completed
  useEffect(() => {
    if (analysisComplete && nodes.length > 0) {
      const timer = setTimeout(() => {
        resetToOverview();
      }, 800); // Delay to allow for smooth completion transition
      
      return () => clearTimeout(timer);
    }
  }, [analysisComplete, nodes.length, resetToOverview]);

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

  // Ensure canvas redraws properly when panel state changes (opening AND closing)
  useEffect(() => {
    // Force a canvas redraw after panel transition completes but before focus animation
    const redrawTimeout = setTimeout(() => {
      // The main drawing useEffect will handle the redraw automatically
      // by depending on [transform, nodes, selectedNode]
      setTransform(prev => ({ ...prev })); // Trigger redraw without changing values
    }, 320); // Right after panel transition, before focus starts

    return () => clearTimeout(redrawTimeout);
  }, [selectedNode]); // Triggers on both opening (selectedNode set) and closing (selectedNode = null)

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

  // Helper function to get current input value
  const getCurrentValue = (inputId: string) => {
    const input = inputs.find(inp => inp.id === inputId);
    return input?.value || '';
  };

  // Check if all inputs are filled and prompt to save if needed
  const checkAndPromptSave = () => {
    // Only prompt save when ALL inputs are completed with actual values (not skipped)
    const allInputsCompleted = inputs.every(input => input.completed && input.value.trim() !== '');
    if (allInputsCompleted && !analysisComplete && !showSaveProjectPrompt && !currentProject) {
      setShowSaveProjectPrompt(true);
    }
  };

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
      // Create new project only if no current project (fallback)
      const productSelection = getCurrentValue('product');
      const projectName = productSelection || 'LCA Analysis';
      
      // Extract product name and functional unit from selection
      const match = projectName.match(/^(.+?)\s*\((.+?)\)$/);
      const cleanName = match ? match[1] : projectName;
      const functionalUnit = match ? match[2] : '1 unit';
      
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
    
    setAnalysisComplete(true);
    setShowSaveProjectPrompt(false);
    
    // Show success notification
    setProjectSaved(true);
    setTimeout(() => setProjectSaved(false), 3000);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    // Save current project progress before switching tabs
    if (activeTab === 'modeler') {
      saveCurrentProjectProgress();
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
    
    // Save the current analysis as a completed project
    saveCurrentProject();
    
    // Trigger showing full graph view
    setTimeout(() => {
      // This will be handled by the graph component's auto-focus
    }, 500);
  };

  // Save current LCA analysis as a project
  const saveCurrentProject = () => {
    // Only save if all inputs are completed with actual values
    const allInputsCompleted = inputs.every(input => input.completed && input.value.trim() !== '');
    if (!allInputsCompleted) {
      console.warn('Cannot save project: Not all inputs are completed with values');
      return;
    }

    // If we have a current project, update it; otherwise create new one
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
      // Create new project only if no current project (fallback)
      const newProjectId = `project_${Date.now()}`;
      const projectName = `LCA Analysis ${new Date().toLocaleDateString()}`;
      
      const newProject: Project = {
        id: newProjectId,
        name: projectName,
        description: 'Completed LCA analysis with full data inputs',
        functionalUnit: '1 unit',
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        status: 'Completed',
        type: 'Other',
        lcaData: {
          inputs: [...inputs],
          graphNodes: [...graphNodes],
          analysisComplete: true
        }
      };

      // Add new project to the list
      setProjects(prevProjects => [...prevProjects, newProject]);
      setCurrentProject(newProject);
    }
    
    // Show success notification
    setProjectSaved(true);
    setTimeout(() => setProjectSaved(false), 3000);
  };

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
  const saveCurrentProjectProgress = () => {
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
  };

  // Open a saved completed project
  const openSavedProject = (project: Project) => {
    // Save current project progress before switching
    saveCurrentProjectProgress();
    
    if (project.lcaData) {
      // Load the project data
      setCurrentProject(project);
      setInputs(project.lcaData.inputs);
      setGraphNodes(project.lcaData.graphNodes);
      setAnalysisComplete(project.lcaData.analysisComplete);
      
      // Reset current step to last incomplete step or 0
      const lastIncompleteIndex = project.lcaData.inputs.findIndex(input => !input.completed && !input.skipped);
      setCurrentStep(lastIncompleteIndex >= 0 ? lastIncompleteIndex : 0);
      
      // Switch to the modeler tab to view the analysis
      setActiveTab('modeler');
    }
  };

  // Continue working on a draft or active project
  const continueProject = (project: Project) => {
    // Save current project progress before switching
    saveCurrentProjectProgress();
    
    setCurrentProject(project);
    
    // If project has saved LCA data, load it
    if (project.lcaData) {
      setInputs(project.lcaData.inputs);
      setGraphNodes(project.lcaData.graphNodes);
      setAnalysisComplete(project.lcaData.analysisComplete);
      
      // Set current step to the first incomplete input
      const firstIncompleteIndex = project.lcaData.inputs.findIndex(input => !input.completed && !input.skipped);
      setCurrentStep(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
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
    
    // Save the completed project
    saveCurrentProject();
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
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {project.createdDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Modified: {project.lastModified}</span>
                      </div>
                    </div>

                    {/* Open Project Button for Completed Projects */}
                    {project.status === 'Completed' && project.lcaData && (
                      <button
                        onClick={() => openSavedProject(project)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Open Analysis</span>
                      </button>
                    )}

                    {/* Continue Project Button for Draft/Active Projects */}
                    {(project.status === 'Draft' || project.status === 'Active') && (
                      <button
                        onClick={() => continueProject(project)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Continue</span>
                      </button>
                    )}
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
              >
                {/* Left Panel - Input Forms */}
                <div className="w-[32rem] bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-r border-gray-700/30 p-4 overflow-hidden ml-20">
                  <LifeCycleModeler 
                    inputs={inputs}
                    setInputs={setInputs}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onShowMissingValuesPopup={handleShowMissingValuesPopup}
                    onComplete={handleComplete}
                    onInputChange={checkAndPromptSave}
                  />
                </div>
                
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
                    onNodesChange={setGraphNodes}
                    onNodeInfoUpdate={setCurrentNodeInfo}
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
                All inputs have been filled. Would you like to save this analysis as a project?
              </p>
            </div>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-600/30">
              <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center">
                <FolderOpen className="w-4 h-4 mr-2 text-green-400" />
                Project Details:
              </h3>
              <div className="text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="text-green-400 font-medium">
                    {getCurrentValue('product') || 'LCA Analysis'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowSaveProjectPrompt(false)}
                className="flex-1 bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
              >
                Continue Without Saving
              </button>
              <button
                onClick={saveProjectFromPrompt}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Save Project</span>
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
              We found <span className="text-purple-400 font-semibold">{missingInputs.length} missing values</span> in your analysis. 
              Our AI can intelligently fill these with industry-standard estimates based on your existing inputs.
            </p>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-gray-600/30">
              <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Missing Fields:
              </h3>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {missingInputs.map((input, index) => (
                  <li key={index} className="flex items-center text-xs text-gray-300">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 flex-shrink-0"></div>
                    {input.label}
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
    </main>
  );
}
