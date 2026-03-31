import { Outlet } from 'react-router-dom'

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF9' }}>
      {/* Header */}
      <header
        className="bg-white flex items-center justify-between px-6"
        style={{
          height: '48px',
          borderBottom: '1px solid #DADFE3',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <img src="/images/Lendio-Logo-2024.svg" alt="Lendio" height="30" style={{ height: '30px' }} />
        <span className="text-sm font-medium" style={{ color: '#6B717A' }}>
          Business Loan Application
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: '860px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
