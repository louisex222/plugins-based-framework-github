import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import router from './router'
import './index.css'
import './i18n'
import { ThemeProvider } from '@/components/custom/theme-provider'
import { Toaster } from '@/components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster
        duration={2000}
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'group toast',
            info: '!bg-[#000000] !text-white !border-none',
            success: '!bg-[#10b981] !text-white !border-none',
            error: '!bg-[#ef4444] !text-white !border-none',
          },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>,
)
