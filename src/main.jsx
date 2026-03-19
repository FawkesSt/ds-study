import React from 'react'
import ReactDOM from 'react-dom/client'
import '../dist/tokens.css'
import { Button } from './components/Button/Button'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: '40px', display: 'flex', gap: '16px' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  </React.StrictMode>
)