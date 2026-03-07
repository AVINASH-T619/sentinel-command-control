import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Entity } from '@/data/mockData';
import { User, Bot, Building2, TreePine } from 'lucide-react';

interface EntityGraphProps {
    centerEntity: any;
    allEntities: any[];
}

const typeIcons: Record<string, React.ElementType> = {
    person: User, asset: Bot, infrastructure: Building2, environment: TreePine,
};

const typeColors: Record<string, string> = {
    person: "text-severity-info border-severity-info/30 bg-severity-info/10",
    asset: "text-severity-low border-severity-low/30 bg-severity-low/10",
    infrastructure: "text-severity-medium border-severity-medium/30 bg-severity-medium/10",
    environment: "text-severity-high border-severity-high/30 bg-severity-high/10",
};

export function EntityGraph({ centerEntity, allEntities }: EntityGraphProps) {
    // Simple radial layout calculation
    const graphData = useMemo(() => {
        if (!centerEntity) return { nodes: [], links: [] };

        const nodes: any[] = [{ ...centerEntity, x: 250, y: 200, isCenter: true }];
        const links: any[] = [];
        const addedNodeIds = new Set([centerEntity.id]);

        // 1st degree connections (outbound)
        centerEntity.relationships?.forEach((rel: any) => {
            const target = allEntities.find((e: any) => e.id === rel.targetId);
            if (target && !addedNodeIds.has(target.id)) {
                nodes.push({ ...target, relType: rel.type, parentId: centerEntity.id });
                addedNodeIds.add(target.id);
            }
        });

        // 1st degree connections (inbound - things connecting TO this entity)
        allEntities.forEach((e: any) => {
            if (e.id === centerEntity.id) return;
            const relToCenter = e.relationships?.find((r: any) => r.targetId === centerEntity.id);
            if (relToCenter && !addedNodeIds.has(e.id)) {
                nodes.push({ ...e, relType: relToCenter.type, parentId: centerEntity.id, isInbound: true });
                addedNodeIds.add(e.id);
            }
        });

        // Position peripheral nodes in a circle
        const radius = 130;
        const peripheralCount = nodes.length - 1;
        let index = 0;

        nodes.forEach((node) => {
            if (!node.isCenter) {
                const angle = (index / peripheralCount) * 2 * Math.PI;
                node.x = 250 + radius * Math.cos(angle);
                node.y = 200 + radius * Math.sin(angle);
                index++;

                links.push({
                    id: `${node.parentId}-${node.id}`,
                    source: node.isInbound ? node : nodes[0],
                    target: node.isInbound ? nodes[0] : node,
                    label: node.relType
                });
            }
        });

        return { nodes, links };
    }, [centerEntity, allEntities]);

    if (!centerEntity) return null;

    return (
        <div className="relative w-full h-[400px] bg-secondary/10 rounded-xl overflow-hidden tactical-grid border border-border/50">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {graphData.links.map((link, i) => {
                    const midX = (link.source.x + link.target.x) / 2;
                    const midY = (link.source.y + link.target.y) / 2;

                    return (
                        <g key={link.id}>
                            <motion.line
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.5 }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                x1={link.source.x}
                                y1={link.source.y}
                                x2={link.target.x}
                                y2={link.target.y}
                                stroke="hsl(var(--primary))"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                            />
                            <motion.circle
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 + i * 0.1 }}
                                cx={midX}
                                cy={midY}
                                r={3}
                                fill="hsl(var(--background))"
                                stroke="hsl(var(--primary))"
                                strokeWidth={1}
                            />
                            <motion.text
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 + i * 0.1 }}
                                x={midX}
                                y={midY - 8}
                                fill="hsl(var(--muted-foreground))"
                                fontSize="9"
                                textAnchor="middle"
                                className="font-mono"
                            >
                                {link.label}
                            </motion.text>
                        </g>
                    );
                })}
            </svg>

            {graphData.nodes.map((node, i) => {
                const Icon = typeIcons[node.type] || Bot;
                const colorClass = typeColors[node.type] || "text-foreground border-border bg-secondary";

                return (
                    <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: node.isCenter ? 1.1 : 1 }}
                        transition={{ type: 'spring', bounce: 0.5, delay: node.isCenter ? 0 : 0.5 + i * 0.05 }}
                        className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 ${node.isCenter ? 'z-20' : 'z-10 cursor-pointer hover:scale-110 transition-transform'}`}
                        style={{ left: node.x, top: node.y }}
                    >
                        <div className={`p-3 rounded-full border-2 backdrop-blur-md ${colorClass} ${node.isCenter ? 'shadow-[0_0_20px_rgba(var(--primary),0.2)]' : ''}`}>
                            <Icon className={node.isCenter ? "h-6 w-6" : "h-4 w-4"} />
                        </div>
                        <div className={`mt-2 text-center bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded border border-border/50 text-foreground whitespace-nowrap ${node.isCenter ? 'text-xs font-semibold' : 'text-[10px]'}`}>
                            {node.name}
                        </div>
                        {!node.isCenter && (
                            <div className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wider bg-background/80 px-1 rounded">
                                {node.id}
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
