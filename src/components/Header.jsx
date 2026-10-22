import { Sun, Moon } from 'lucide-react'

export function Header({ theme, toggleTheme, unit, setUnit }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-group">
          <div className="brand-mark">
            <span className="brand-dot" aria-hidden="true"></span>
            <span className="brand-initial">m.</span>
          </div>
          <div className="brand-meta">
            <span className="brand-name">Mintix Weather</span>
            <span className="brand-badge">EDITION 2026</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Moon size={16} aria-hidden="true" />
            ) : (
              <Sun size={16} aria-hidden="true" />
            )}
          </button>

          <div
            className="unit-switch"
            role="group"
            aria-label="Temperature unit selector"
          >
            <button
              type="button"
              className={unit === 'C' ? 'active' : ''}
              onClick={() => {
                setUnit('C')
                localStorage.setItem('weatherUnit', 'C')
              }}
            >
              °C
            </button>
            <button
              type="button"
              className={unit === 'F' ? 'active' : ''}
              onClick={() => {
                setUnit('F')
                localStorage.setItem('weatherUnit', 'F')
              }}
            >
              °F
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

