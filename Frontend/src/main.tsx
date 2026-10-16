import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

// Create a QueryClient instance
const queryClient = new QueryClient(); //this is creating the instance from the queryclient
//The QueryClient instance manages query-related functionality, including cached server data, query state, and mutation defaults.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <QueryClientProvider client={queryClient}>
        <AuthProvider>
      <BrowserRouter>
      <App />
      </BrowserRouter>
      </AuthProvider>
        </QueryClientProvider>
  </StrictMode>,
)

//QueryClient - it is a class provided by tanstack react query
//queryclientprovider is a component that makes the query client available to your react components

//StrictMode is a built-in React development tool that helps you find potential bugs in your components.
//Instead, it checks certain aspects of how your application behaves during development.