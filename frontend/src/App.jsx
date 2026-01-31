import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function App() {
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('Describe this image.')
  const [model, setModel] = useState('qwen3-vl')
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    setResponse('')
    setError('')
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse('')
    try {
      if (!file) throw new Error('Please select an image file.')
      const fd = new FormData()
      fd.append('image', file)
      fd.append('prompt', prompt)
      fd.append('model', model)

      const res = await fetch(`${API_URL}/vision`, {
        method: 'POST',
        body: fd
      })
      if (!res.ok) throw new Error(`Server responded ${res.status}`)
      const data = await res.json()
      setResponse(typeof data.response === 'string' ? data.response : JSON.stringify(data))
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, Arial, sans-serif', margin: '2rem' }}>
      <h1>Ollama Vision (qwen3-vl)</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 640 }}>
        <label>
          Image file:
          <input type="file" accept="image/*" onChange={onFileChange} />
        </label>
        <label>
          Prompt:
          <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </label>
        <label>
          Model:
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Analyze'}</button>
      </form>

      {preview && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Preview</h3>
          <img src={preview} alt="preview" style={{ maxWidth: '100%', border: '1px solid #ddd' }} />
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</div>
      )}

      {response && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Response</h3>
          <pre style={{ background: '#f5f5f5', padding: '1rem', whiteSpace: 'pre-wrap' }}>{response}</pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', color: '#555' }}>
        Backend: {API_URL}/vision
      </div>
    </div>
  )
}
