import { Toaster } from 'react-hot-toast'

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#2F3637',
          border: '1px solid #DADFE3',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: "'proxima-nova', 'Helvetica Neue', Arial, sans-serif",
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        success: {
          iconTheme: {
            primary: '#0800A6',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#d9534f',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid #d9534f',
          },
        },
      }}
    />
  )
}
