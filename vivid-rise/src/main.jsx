import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 👇 [정답] BrowserRouter를 뺐습니다. (App.jsx가 알아서 하도록!)
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)