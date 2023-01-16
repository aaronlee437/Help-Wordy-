import React from 'react'
import ReactDOM from 'react-dom/client'
import {InitStock} from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <InitStock />
  </React.StrictMode>,
)
