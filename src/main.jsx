import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Demo from './components/Demo'

const isDemo = window.location.pathname === '/demo' ||
  new URLSearchParams(window.location.search).get('demo') === 'true'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isDemo ? <Demo /> : <App />}
  </React.StrictMode>
)
