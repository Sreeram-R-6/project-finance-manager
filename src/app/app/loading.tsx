export default function Loading() {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading project">
      <div className="skeleton" style={{ height: 70, width: "65%" }} />
      <div className="skeleton" style={{ height: 260 }} />
      <div className="metric-strip">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 60, margin: 8 }} />
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="skeleton" style={{ height: 230 }} />
        <div className="skeleton" style={{ height: 230 }} />
      </div>
    </div>
  );
}
