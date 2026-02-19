import { useEffect, useState, useRef } from 'react';
import { graphAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  tier: number;
  difficulty: number;
  status?: string;
  skill_level?: number;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
}

export default function KnowledgeGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      const { data } = await graphAPI.getStudentGraph();
      const positionedNodes = calculateNodePositions(data.nodes);
      setNodes(positionedNodes);
      setEdges(data.edges);
    } catch (error) {
      toast.error('Failed to load knowledge graph');
    } finally {
      setLoading(false);
    }
  };

  const calculateNodePositions = (nodeList: Node[]): Node[] => {
    const tierGroups: { [key: number]: Node[] } = {};
    
    // Group nodes by tier
    nodeList.forEach(node => {
      if (!tierGroups[node.tier]) {
        tierGroups[node.tier] = [];
      }
      tierGroups[node.tier].push(node);
    });

    const positioned: Node[] = [];
    const width = 1200;
    const height = 800;
    const tierSpacing = height / 6;

    Object.keys(tierGroups).forEach(tierKey => {
      const tier = parseInt(tierKey);
      const tierNodes = tierGroups[tier];
      const nodeSpacing = width / (tierNodes.length + 1);

      tierNodes.forEach((node, index) => {
        positioned.push({
          ...node,
          x: nodeSpacing * (index + 1),
          y: tierSpacing * tier,
        });
      });
    });

    return positioned;
  };

  const getNodeColor = (node: Node) => {
    if (!node.status || node.status === 'untouched') return '#d1d5db';
    if (node.status === 'gap') return '#f87171';
    if (node.status === 'learning') return '#fbbf24';
    if (node.status === 'mastered') return '#34d399';
    return '#d1d5db';
  };

  const getNodeStrokeColor = (node: Node) => {
    if (selectedNode?.id === node.id) return '#0284c7';
    return '#6b7280';
  };

  const getTierNodes = (tier: number) => {
    return nodes.filter((n) => n.tier === tier);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  const tiers = [1, 2, 3, 4, 5];
  const tierLabels = ['Foundations', 'Core Data Structures', 'Non-Linear DS', 'Core Algorithms', 'Advanced'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Knowledge Graph</h1>
              <p className="text-gray-600 mt-1">Your personalized DSA learning path</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('visual')}
                className={`btn ${viewMode === 'visual' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Visual
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-3 card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Concept Dependencies</h2>
              <div className="flex gap-4 items-center">
                {viewMode === 'visual' && (
                  <div className="flex gap-2">
                    <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded">
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button onClick={handleResetZoom} className="p-2 hover:bg-gray-100 rounded">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded">
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span>Not Started</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <span>Learning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span>Mastered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span>Gap</span>
                  </div>
                </div>
              </div>
            </div>

            {viewMode === 'visual' ? (
              <div className="overflow-auto border border-gray-200 rounded-lg bg-white">
                <svg
                  ref={svgRef}
                  width="1200"
                  height="800"
                  className="w-full"
                  style={{ minHeight: '600px' }}
                >
                  <g transform={`scale(${zoom})`}>
                    {/* Draw edges first (so they appear behind nodes) */}
                    {edges.map((edge, idx) => {
                      const sourceNode = nodes.find(n => n.id === edge.source);
                      const targetNode = nodes.find(n => n.id === edge.target);
                      if (!sourceNode || !targetNode || !sourceNode.x || !targetNode.x) return null;

                      return (
                        <line
                          key={idx}
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="#cbd5e1"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      );
                    })}

                    {/* Arrow marker definition */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill="#cbd5e1" />
                      </marker>
                    </defs>

                    {/* Draw nodes */}
                    {nodes.map((node) => {
                      if (!node.x || !node.y) return null;
                      const radius = 40;

                      return (
                        <g
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          style={{ cursor: 'pointer' }}
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius}
                            fill={getNodeColor(node)}
                            stroke={getNodeStrokeColor(node)}
                            strokeWidth={selectedNode?.id === node.id ? 4 : 2}
                            className="transition-all hover:stroke-primary-600"
                          />
                          <text
                            x={node.x}
                            y={node.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-medium pointer-events-none"
                            fill="#1f2937"
                          >
                            {node.name.length > 12
                              ? node.name.substring(0, 10) + '...'
                              : node.name}
                          </text>
                          <text
                            x={node.x}
                            y={node.y + 15}
                            textAnchor="middle"
                            className="text-xs pointer-events-none"
                            fill="#6b7280"
                          >
                            T{node.tier}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>
            ) : (
              <div className="space-y-8">
                {[1, 2, 3, 4, 5].map((tier) => {
                  const tierNodes = getTierNodes(tier);
                  if (tierNodes.length === 0) return null;
                  const tierLabels = ['Foundations', 'Core Data Structures', 'Non-Linear DS', 'Core Algorithms', 'Advanced'];

                  return (
                    <div key={tier}>
                      <h3 className="text-sm font-semibold text-gray-600 mb-3">
                        Tier {tier}: {tierLabels[tier - 1]}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {tierNodes.map((node) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:ring-2 hover:ring-primary-500 ${
                              selectedNode?.id === node.id ? 'ring-2 ring-primary-600' : ''
                            }`}
                            style={{ backgroundColor: getNodeColor(node) }}
                          >
                            {node.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> {viewMode === 'visual' 
                  ? 'Arrows show concept dependencies. Concepts at the top are prerequisites for those below.'
                  : 'Concepts are organized by tier. Master lower tiers before moving to advanced topics.'
                } Click on a concept to see details.
              </p>
            </div>
          </div>

          {/* Node Details */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Details</h2>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tier {selectedNode.tier} • Difficulty {selectedNode.difficulty}/5
                  </p>
                </div>

                {selectedNode.status && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm mt-1 ${
                        selectedNode.status === 'mastered'
                          ? 'bg-green-100 text-green-800'
                          : selectedNode.status === 'learning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedNode.status === 'gap'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                    </span>
                  </div>
                )}

                {selectedNode.skill_level !== undefined && selectedNode.skill_level > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Skill Level</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          selectedNode.skill_level >= 0.7
                            ? 'bg-green-500'
                            : selectedNode.skill_level >= 0.4
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedNode.skill_level * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.round(selectedNode.skill_level * 100)}%
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Dependencies: {edges.filter((e) => e.source === selectedNode.id).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Required by: {edges.filter((e) => e.target === selectedNode.id).length} concepts
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Click on a concept to see details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
