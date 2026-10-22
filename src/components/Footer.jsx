export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-brand">
            <span className="footer-mark">m.</span>
            <span className="footer-name">Mintix Weather</span>
          </div>
          <p className="footer-bio">
            A calm, editorial atmospheric instrument designed for daily life in Ukraine.
          </p>
        </div>

        <div className="footer-right">
          <div className="footer-metadata">
            <span>Data source: Open-Meteo API</span>
            <span>Cartography: MapLibre GL & OpenFreeMap</span>
          </div>
          <p className="footer-copy">
            © 2026 Mintix Ecosystem • Crafted with restraint and clarity.
          </p>
        </div>
      </div>
    </footer>
  )
}

