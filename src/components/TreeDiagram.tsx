/**
 * TreeDiagram component for visualizing decision tree structure
 * Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 6.1, 6.2, 6.3, 6.4
 */

import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { hierarchy, tree } from 'd3-hierarchy';
import { HierarchyPointNode } from 'd3-hierarchy';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// Tree node data structure from ML Engine
interface TreeNode {
    id: string;
    depth: number;
    feature: number | null;
    threshold: number | null;
    prediction: number | null;
    samples: number;
    impurity: number;
    left: TreeNode | null;
    right: TreeNode | null;
}

interface TreeState {
    root: TreeNode;
    currentDepth: number;
    maxDepth: number;
    nodeCount: number;
    leafCount: number;
}

interface TreeDiagramProps {
    treeData: TreeState;
    currentDepth: number;
    highlightedNode: string | null;
    onNodeHover: (nodeId: string | null) => void;
    onNodeClick?: (nodeId: string) => void;
    zoom: number;
    pan: { x: number; y: number };
    width?: number;
    height?: number;
}

const TreeDiagram: React.FC<TreeDiagramProps> = ({
    treeData,
    currentDepth,
    highlightedNode,
    onNodeHover,
    onNodeClick,
    zoom,
    pan,
    width = 800,
    height = 600,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [localPan, setLocalPan] = useState(pan);
    const [localZoom, setLocalZoom] = useState(zoom);
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [userInteracted, setUserInteracted] = useState(false);

    // Sync local state with props
    useEffect(() => {
        setLocalPan(pan);
    }, [pan]);

    useEffect(() => {
        setLocalZoom(zoom);
    }, [zoom]);

    // Handle zoom in
    const handleZoomIn = useCallback(() => {
        setUserInteracted(true);
        setLocalZoom((prev) => Math.min(3.0, prev + 0.2));
    }, []);

    // Handle zoom out
    const handleZoomOut = useCallback(() => {
        setUserInteracted(true);
        setLocalZoom((prev) => Math.max(0.5, prev - 0.2));
    }, []);

    // Handle reset zoom
    const handleResetZoom = useCallback(() => {
        setLocalZoom(1.0);
        setLocalPan({ x: 0, y: 0 });
    }, []);

    // Handle drag start
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) { // Left mouse button
            setIsDragging(true);
            setUserInteracted(true);
            setDragStart({ x: e.clientX - localPan.x, y: e.clientY - localPan.y });
        }
    }, [localPan]);

    // Handle drag move
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setLocalPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart]);

    // Handle touch pad / scroll wheel for zoom and pan
    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); // Prevent page scroll and browser zoom
            setUserInteracted(true);

            if (e.ctrlKey) {
                // Pinch-to-zoom or Ctrl+Scroll
                const zoomDelta = -e.deltaY * 0.01;
                setLocalZoom(prev => Math.max(0.1, Math.min(5.0, prev + zoomDelta)));
            } else {
                // Two-finger pan or regular scroll
                setLocalPan(prev => ({
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY
                }));
            }
        };

        svgElement.addEventListener('wheel', handleWheel, { passive: false });
        return () => svgElement.removeEventListener('wheel', handleWheel);
    }, []);

    // Handle drag end
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Get all node IDs in depth-first order for keyboard navigation
    const getAllNodeIds = useCallback((): string[] => {
        if (!treeData || !treeData.root) return [];

        const ids: string[] = [];
        const traverse = (node: TreeNode) => {
            ids.push(node.id);
            if (node.left) traverse(node.left);
            if (node.right) traverse(node.right);
        };
        traverse(treeData.root);
        return ids;
    }, [treeData]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!treeData || !treeData.root) return;

        const nodeIds = getAllNodeIds();
        const currentIndex = focusedNodeId ? nodeIds.indexOf(focusedNodeId) : -1;

        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                // Move to next node
                if (currentIndex < nodeIds.length - 1) {
                    const nextId = nodeIds[currentIndex + 1];
                    setFocusedNodeId(nextId);
                    onNodeHover(nextId);
                }
                break;

            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                // Move to previous node
                if (currentIndex > 0) {
                    const prevId = nodeIds[currentIndex - 1];
                    setFocusedNodeId(prevId);
                    onNodeHover(prevId);
                }
                break;

            case 'Enter':
            case ' ':
                e.preventDefault();
                // Activate node (click)
                if (focusedNodeId && onNodeClick) {
                    onNodeClick(focusedNodeId);
                }
                break;

            case 'Home':
                e.preventDefault();
                // Focus first node (root)
                if (nodeIds.length > 0) {
                    setFocusedNodeId(nodeIds[0]);
                    onNodeHover(nodeIds[0]);
                }
                break;

            case 'End':
                e.preventDefault();
                // Focus last node
                if (nodeIds.length > 0) {
                    const lastId = nodeIds[nodeIds.length - 1];
                    setFocusedNodeId(lastId);
                    onNodeHover(lastId);
                }
                break;
        }
    }, [treeData, focusedNodeId, getAllNodeIds, onNodeHover, onNodeClick]);

    // Handle node focus
    const handleNodeFocus = useCallback((nodeId: string) => {
        setFocusedNodeId(nodeId);
        onNodeHover(nodeId);
    }, [onNodeHover]);

    // Handle node blur
    const handleNodeBlur = useCallback(() => {
        // Don't clear focus immediately to allow navigation
    }, []);

    // Convert ML Engine tree to D3 hierarchy format
    const hierarchyData = useMemo(() => {
        if (!treeData || !treeData.root) return null;

        const convertNode = (node: TreeNode): any => {
            const result: any = {
                id: node.id,
                depth: node.depth,
                feature: node.feature,
                threshold: node.threshold,
                prediction: node.prediction,
                samples: node.samples,
                impurity: node.impurity,
                children: [],
            };

            if (node.left) {
                result.children.push(convertNode(node.left));
            }
            if (node.right) {
                result.children.push(convertNode(node.right));
            }

            if (result.children.length === 0) {
                delete result.children;
            }

            return result;
        };

        return convertNode(treeData.root);
    }, [treeData]);

    // Calculate tree layout using D3
    const layoutData = useMemo(() => {
        if (!hierarchyData) return null;

        const root = hierarchy(hierarchyData);
        const treeLayout = tree<any>()
            .nodeSize([90, 120]) // Fixed spacing: 90px horizontally, 120px vertically
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

        return treeLayout(root);
    }, [hierarchyData]);

    // Auto-fit tree to container when layout changes (if user hasn't manually panned/zoomed)
    useEffect(() => {
        if (!layoutData || userInteracted) return;

        let minX = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        layoutData.each(node => {
            if (node.x < minX) minX = node.x;
            if (node.x > maxX) maxX = node.x;
            if (node.y > maxY) maxY = node.y;
        });

        // Add padding
        const treeWidth = maxX - minX + 120;
        const treeHeight = maxY + 150;

        // Calculate required scale to fit
        const scaleX = width / treeWidth;
        const scaleY = height / treeHeight;
        const autoScale = Math.min(1, scaleX, scaleY); // Max scale 1 (don't scale up tiny trees)

        setLocalZoom(autoScale);

        // Adjust pan to center the tree horizontally if it's lopsided
        const xOffset = -((maxX + minX) / 2) * autoScale;
        
        // Vertically, we want the root near the top, which is handled by the group transform '50'
        setLocalPan({ x: xOffset, y: 0 });
    }, [layoutData, width, height, userInteracted]);

    // Render placeholder if no tree data
    if (!treeData || !treeData.root) {
        return (
            <div
                style={{ width, height }}
                className="flex items-center justify-center bg-gray-50 rounded-lg"
            >
                <p className="text-gray-500">No tree data available</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', width, height }}
            className="tree-diagram-container bg-white rounded-lg border border-gray-200"
            role="tree"
            aria-label={`Decision tree diagram with ${treeData.nodeCount} nodes at depth ${currentDepth}`}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes drawEdge {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>

            {/* Zoom/Pan Controls */}
            <div
                className="absolute top-4 right-4 flex flex-col gap-2 z-10"
                role="toolbar"
                aria-label="Tree diagram controls"
            >
                <button
                    onClick={handleZoomIn}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Zoom in"
                    title="Zoom in"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Zoom out"
                    title="Zoom out"
                >
                    <ZoomOut size={20} />
                </button>
                <button
                    onClick={handleResetZoom}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                >
                    <Maximize2 size={20} />
                </button>
            </div>

            <svg
                ref={svgRef}
                width={width}
                height={height}
                style={{
                    overflow: 'hidden', // Changed from visible to prevent bleeding
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                aria-hidden="true"
            >
                <g
                    className="tree-group"
                    // Center the root horizontally, and place it 50px from top
                    transform={`translate(${width / 2 + localPan.x}, ${50 + localPan.y}) scale(${localZoom})`}
                >
                    {/* Render edges first (so they appear behind nodes) */}
                    {layoutData && layoutData.links().map((link, i) => {
                        const isLeft = !!(link.source.children && link.source.children[0] === link.target);
                        return (
                            <TreeEdgeComponent
                                key={`edge-${i}`}
                                source={link.source}
                                target={link.target}
                                isLeft={isLeft}
                                maxSamples={treeData.root.samples}
                            />
                        );
                    })}

                    {/* Render nodes */}
                    {layoutData && layoutData.descendants().map((node) => (
                        <TreeNodeComponent
                            key={node.data.id}
                            node={node}
                            highlightedNode={highlightedNode}
                            focusedNode={focusedNodeId}
                            onNodeHover={onNodeHover}
                            onNodeClick={onNodeClick}
                            onNodeFocus={handleNodeFocus}
                            onNodeBlur={handleNodeBlur}
                        />
                    ))}
                </g>
            </svg>

            {/* Screen reader description */}
            <div className="sr-only">
                Decision tree with {treeData.nodeCount} nodes at depth {currentDepth} of {treeData.maxDepth}
            </div>
        </div>
    );
};

export default TreeDiagram;

// TreeNode sub-component
interface TreeNodeComponentProps {
    node: HierarchyPointNode<any>;
    highlightedNode: string | null;
    focusedNode: string | null;
    onNodeHover: (nodeId: string | null) => void;
    onNodeClick?: (nodeId: string) => void;
    onNodeFocus: (nodeId: string) => void;
    onNodeBlur: () => void;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
    node,
    highlightedNode,
    focusedNode,
    onNodeHover,
    onNodeClick,
    onNodeFocus,
    onNodeBlur,
}) => {
    const nodeData = node.data;
    const isLeaf = !node.children || node.children.length === 0;
    const isHighlighted = highlightedNode === nodeData.id;
    const isFocused = focusedNode === nodeData.id;

    // Calculate node radius based on sample count (scale between 15-30)
    const radius = Math.max(15, Math.min(30, 15 + (nodeData.samples / 50) * 15));

    // Determine node color
    const getNodeColor = () => {
        if (isLeaf) {
            // Leaf nodes colored by prediction
            return nodeData.prediction === 0 ? '#3B82F6' : '#EF4444'; // blue or red
        }
        return '#8B5CF6'; // purple for internal nodes
    };

    // Get ARIA label for accessibility
    const getAriaLabel = () => {
        if (isLeaf) {
            return `Leaf node: predicts class ${nodeData.prediction}, ${nodeData.samples} samples, impurity ${nodeData.impurity.toFixed(3)}`;
        }
        return `Decision node: split on feature ${nodeData.feature + 1} at threshold ${nodeData.threshold.toFixed(2)}, ${nodeData.samples} samples, impurity ${nodeData.impurity.toFixed(3)}`;
    };

    return (
        <g
            className="tree-node animate-fade-in"
            transform={`translate(${node.x}, ${node.y})`}
            onMouseEnter={() => onNodeHover(nodeData.id)}
            onMouseLeave={() => onNodeHover(null)}
            onClick={() => onNodeClick?.(nodeData.id)}
            onFocus={() => onNodeFocus(nodeData.id)}
            onBlur={onNodeBlur}
            role="treeitem"
            aria-label={getAriaLabel()}
            aria-selected={isFocused}
            tabIndex={isFocused ? 0 : -1}
            style={{
                cursor: 'pointer',
                animation: 'fadeIn 0.3s ease-in-out',
                outline: isFocused ? '2px solid #000' : 'none',
                outlineOffset: '4px'
            }}
        >
            {/* Node circle */}
            <circle
                r={radius}
                fill={getNodeColor()}
                stroke={isHighlighted || isFocused ? '#111827' : '#ffffff'}
                strokeWidth={isHighlighted || isFocused ? 3 : 2}
                opacity={0.95}
                className="transition-all duration-200"
                style={{
                    filter: isHighlighted || isFocused 
                        ? 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.25))' 
                        : 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.12))',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />

            {/* Node label */}
            <text
                textAnchor="middle"
                dy=".3em"
                fontSize="11px"
                fill="#fff"
                fontWeight="600"
                pointerEvents="none"
            >
                {isLeaf ? `C${nodeData.prediction}` : `x${nodeData.feature + 1}`}
            </text>

            {/* Samples count below node */}
            <text
                textAnchor="middle"
                dy={radius + 15}
                fontSize="10px"
                fill="#6B7280"
                pointerEvents="none"
            >
                n={nodeData.samples}
            </text>
        </g>
    );
};

// TreeEdge sub-component
interface TreeEdgeComponentProps {
    source: HierarchyPointNode<any>;
    target: HierarchyPointNode<any>;
    isLeft: boolean;
    maxSamples: number;
}

const TreeEdgeComponent: React.FC<TreeEdgeComponentProps> = ({
    source,
    target,
    isLeft,
    maxSamples,
}) => {
    // Create Bezier curve path
    const createPath = () => {
        const midY = (source.y + target.y) / 2;
        return `M ${source.x},${source.y}
                C ${source.x},${midY}
                  ${target.x},${midY}
                  ${target.x},${target.y}`;
    };

    // Get edge label (split condition)
    const getEdgeLabel = () => {
        if (source.data.feature !== null && source.data.threshold !== null) {
            const condition = isLeft ? '≤' : '>';
            return `x${source.data.feature + 1} ${condition} ${source.data.threshold.toFixed(2)}`;
        }
        return '';
    };

    // Calculate label position (midpoint of curve)
    const labelX = (source.x + target.x) / 2;
    const labelY = (source.y + target.y) / 2;

    // Calculate dynamic edge width based on sample flow
    // Minimum width 1.5, maximum width 8.0 depending on how many samples go down this branch
    const sampleProportion = target.data.samples / Math.max(1, maxSamples);
    const edgeWidth = 1.5 + (sampleProportion * 6.5);

    return (
        <g className="tree-edge">
            {/* Edge path */}
            <path
                d={createPath()}
                fill="none"
                stroke={isLeft ? '#60A5FA' : '#F87171'}
                strokeWidth={edgeWidth}
                opacity={0.75}
                strokeLinecap="round"
                className="transition-all duration-200"
                style={{
                    strokeDasharray: 1000,
                    strokeDashoffset: 1000,
                    animation: 'drawEdge 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}
            />

            <text
                x={labelX}
                y={labelY - 5}
                dx={isLeft ? -5 : 5}
                textAnchor={isLeft ? "end" : "start"}
                fontSize="11px"
                fill="#374151"
                fontWeight="500"
                pointerEvents="none"
                style={{
                    paintOrder: 'stroke',
                    stroke: 'white',
                    strokeWidth: '4px',
                    strokeLinejoin: 'round'
                }}
            >
                {getEdgeLabel()}
            </text>
        </g>
    );
};
