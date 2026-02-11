import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:20px;font-family:sans-serif;">#root 요소를 찾을 수 없습니다.</div>'
} else {
  try {
    const root = ReactDOM.createRoot(rootEl)
    root.render(<App />)
  } catch (err) {
    rootEl.innerHTML = `<div style="padding:20px;font-family:sans-serif;white-space:pre-wrap;">앱 로드 실패:\n${err?.message || String(err)}</div>`
    console.error(err)
  }
}