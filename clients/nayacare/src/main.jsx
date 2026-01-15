import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminPage from './AdminPage.jsx'
import './index.css'

// Simple routing based on URL path
const renderApp = () => {
  const path = window.location.pathname;
  
  if (path === '/admin') {
    return <AdminPage />;
  }
  
  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {renderApp()}
  </React.StrictMode>,
)