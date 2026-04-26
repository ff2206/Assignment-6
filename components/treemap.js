import { treemap, hierarchy, scaleOrdinal, schemeDark2 } from "d3";

export function TreeMap(props) {
    const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;

    const innerWidth = svg_width - margin.left - margin.right;
    const innerHeight = svg_height - margin.top - margin.bottom;

    const color = scaleOrdinal(schemeDark2);

    if (!tree || !tree.children || tree.children.length === 0) {
        return (
            <svg
                viewBox={`0 0 ${svg_width} ${svg_height}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: "100%", height: "100%" }}
            >
                <text x={svg_width / 2} y={svg_height / 2} textAnchor="middle" style={{ fontSize: "14px", fill: "#888" }}>
                    Select at least one attribute
                </text>
            </svg>
        );
    }

    const root = hierarchy(tree)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const treemapLayout = treemap()
        .size([innerWidth, innerHeight])
        .padding(2);

    treemapLayout(root);

    const leaves = root.leaves();

    const getColor = (node) => {
        let current = node;
        while (current.depth > 1) {
            current = current.parent;
        }
        return color(current.data.name);
    };

    return (
        <svg
            viewBox={`0 0 ${svg_width} ${svg_height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
        >
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                {leaves.map((node, i) => {
                    const w = node.x1 - node.x0;
                    const h = node.y1 - node.y0;

                    const ancestors = [];
                    let current = node;
                    while (current.parent) {
                        if (current.data.attr !== undefined) {
                            ancestors.unshift(`${current.data.attr}: ${current.data.name}`);
                        }
                        current = current.parent;
                    }
                    const lines = [...ancestors, `Value: ${node.value}`];

                    return (
                        <g
                            key={i}
                            onClick={() => setSelectedCell(node)}
                            style={{ cursor: "pointer" }}
                        >
                            <rect
                                x={node.x0}
                                y={node.y0}
                                width={w}
                                height={h}
                                fill={getColor(node)}
                                stroke="white"
                                strokeWidth={1}
                                opacity={selectedCell && selectedCell !== node ? 0.6 : 1}
                            />
                            <text style={{ fontSize: "12px", fill: "white", pointerEvents: "none" }}>
                                {lines.map((line, idx) => (
                                    <tspan
                                        key={idx}
                                        x={node.x0 + 4}
                                        dy={idx === 0 ? node.y0 + 14 : 14}
                                    >
                                        {line}
                                    </tspan>
                                ))}
                            </text>
                            {w > 60 && h > 60 && (
                                <text
                                    x={(node.x0 + node.x1) / 2}
                                    y={(node.y0 + node.y1) / 2}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{
                                        fontSize: `${Math.min(w / 8, 28)}px`,
                                        fill: getColor(node),
                                        opacity: 0.3,
                                        fontWeight: "bold",
                                        pointerEvents: "none"
                                    }}
                                >
                                    {node.data.attr}: {node.data.name}
                                </text>
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    );
}