import { useMemo, useState } from "react";
import "./ComparisonGraph.css";

function ComparisonGraph({ results }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const points = useMemo(() => {
    return results.map((r, index) => ({
      index,
      fileName: r.fileName,
      score: Math.max(0, Math.min(100, Number(r.score) || 0)),
      aiMatchPercentage:
        r.aiMatchPercentage !== undefined && r.aiMatchPercentage !== null
          ? Number(r.aiMatchPercentage)
          : null,
    }));
  }, [results]);

  const WIDTH = 900;
  const HEIGHT = 360;
  const PADDING = { top: 30, right: 40, bottom: 80, left: 60 };
  const innerW = WIDTH - PADDING.left - PADDING.right;
  const innerH = HEIGHT - PADDING.top - PADDING.bottom;

  const xStep =
    points.length > 1 ? innerW / (points.length - 1) : 0;

  const getCoords = (i) => {
    const x =
      points.length === 1
        ? PADDING.left + innerW / 2
        : PADDING.left + i * xStep;
    const y = PADDING.top + innerH - (points[i].score / 100) * innerH;
    return { x, y };
  };

  const truncate = (name, max = 18) => {
    if (!name) return "";
    if (name.length <= max) return name;
    return name.slice(0, max - 1) + "…";
  };

  const yTicks = [0, 20, 40, 60, 80, 100];

  const pathD = points
    .map((_, i) => {
      const { x, y } = getCoords(i);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaD =
    points.length > 0
      ? `${pathD} L ${
          PADDING.left + (points.length - 1) * xStep
        } ${PADDING.top + innerH} L ${PADDING.left} ${
          PADDING.top + innerH
        } Z`
      : "";

  return (
    <div className="comparison-graph">
      <h3>
        Candidate Comparison
      </h3>

      <div className="line-chart-wrapper">
        <svg
          className="line-chart-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Candidate match score line chart"
        >
          <defs>
            <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="#5965f2"
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor="#5965f2"
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines and labels */}
          {yTicks.map((tick) => {
            const y =
              PADDING.top + innerH - (tick / 100) * innerH;
            return (
              <g key={`ytick-${tick}`}>
                <line
                  className="grid-line"
                  x1={PADDING.left}
                  y1={y}
                  x2={PADDING.left + innerW}
                  y2={y}
                />
                <text
                  className="axis-label y-label"
                  x={PADDING.left - 12}
                  y={y + 4}
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Y-axis title */}
          <text
            className="axis-title"
            x={-(PADDING.top + innerH / 2)}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
          >
            Match Score (%)
          </text>

          {/* X-axis baseline */}
          <line
            className="axis-line"
            x1={PADDING.left}
            y1={PADDING.top + innerH}
            x2={PADDING.left + innerW}
            y2={PADDING.top + innerH}
          />

          {/* Area under line */}
          {points.length > 0 && (
            <path
              d={areaD}
              fill="url(#lineAreaGradient)"
            />
          )}

          {/* Line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#5965f2"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points + X labels + hover targets */}
          {points.map((p, i) => {
            const { x, y } = getCoords(i);
            const isHovered = hoverIndex === i;
            return (
              <g key={`pt-${i}`}>
                <circle
                  className="data-point"
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 6}
                  fill="white"
                  stroke="#5965f2"
                  strokeWidth="3"
                />
                <text
                  className="axis-label x-label"
                  x={x}
                  y={PADDING.top + innerH + 22}
                  textAnchor="middle"
                >
                  {truncate(p.fileName, 16)}
                </text>
                <text
                  className="axis-label x-label-rank"
                  x={x}
                  y={PADDING.top + innerH + 40}
                  textAnchor="middle"
                >
                  #{i + 1}
                </text>

                {/* Invisible hover target for easier hovering */}
                <rect
                  className="hover-target"
                  x={x - 20}
                  y={PADDING.top}
                  width={40}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onFocus={() => setHoverIndex(i)}
                  onBlur={() => setHoverIndex(null)}
                  tabIndex={0}
                />

                {isHovered && (
                  <g className="tooltip">
                    <rect
                      x={Math.min(
                        Math.max(x - 60, 4),
                        WIDTH - 124
                      )}
                      y={Math.max(y - 60, 4)}
                      width="120"
                      height="50"
                      rx="8"
                      ry="8"
                      fill="#172033"
                    />
                    <text
                      x={Math.min(
                        Math.max(x - 60, 4),
                        WIDTH - 124
                      ) + 60}
                      y={Math.max(y - 60, 4) + 20}
                      textAnchor="middle"
                      className="tooltip-name"
                    >
                      {truncate(p.fileName, 18)}
                    </text>
                    <text
                      x={Math.min(
                        Math.max(x - 60, 4),
                        WIDTH - 124
                      ) + 60}
                      y={Math.max(y - 60, 4) + 40}
                      textAnchor="middle"
                      className="tooltip-score"
                    >
                      Score: {p.score}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default ComparisonGraph;
