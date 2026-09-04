import { useMemo } from "react";
import "./ComparisonGraph.css";

function ComparisonGraph({ results }) {
  const maxCount = useMemo(() => {
    const max = results.reduce(
      (acc, r) => Math.max(acc, r.score),
      0
    );
    return max > 0 ? max : 1;
  }, [results]);

  const getScoreColor = (score) => {
    if (score >= 80) return "#25834b";
    if (score >= 60) return "#3472b8";
    if (score >= 40) return "#9a7216";
    return "#c33e3e";
  };

  return (
    <div className="comparison-graph">
      <h3>
        Candidate Comparison
      </h3>

      <div className="comparison-bars">
        {results.map((result, index) => {
          const percentage = Math.round(
            (result.score / maxCount) * 100
          );

          return (
            <div
              className="comparison-row"
              key={`comparison-${result.fileName}-${index}`}
            >
              <div className="comparison-label">
                <span className="rank-tag">
                  #{index + 1}
                </span>
                <span className="candidate-name">
                  {result.fileName}
                </span>
              </div>

              <div className="comparison-bar-wrapper">
                <div
                  className="comparison-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: getScoreColor(result.score),
                  }}
                >
                  <span
                    className="comparison-bar-text"
                    style={{
                      color: getScoreColor(result.score),
                    }}
                  >
                    {result.score}%
                  </span>
                </div>
              </div>

              {result.aiMatchPercentage !== undefined &&
                result.aiMatchPercentage !== null && (
                  <div className="ai-badge">
                    AI: {result.aiMatchPercentage}%
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ComparisonGraph;
