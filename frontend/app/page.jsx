'use client'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Page() {
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

      const res = await fetch(`${API_URL}/vision`, { method: 'POST', body: fd })
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
    <main className="container">
      <header className="header">
        <h1 className="title">Ollama Vision</h1>
        <p className="subtitle">Upload images and get descriptions with <strong>qwen3-vl</strong>.</p>
      </header>

      <section className="grid two-col">
        <div className="card">
          <div className="card-inner">
            <div className="section-title">Input</div>
            <form className="form" onSubmit={onSubmit}>
              <div>
                <div className="label">Image file</div>
                <input className="file-input" type="file" accept="image/*" onChange={onFileChange} />
              </div>
              <div className="row">
                <div>
                  <div className="label">Prompt</div>
                  <input className="input" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </div>
                <div>
                  <div className="label">Model</div>
                  <input className="input" type="text" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>
              <div className="actions">
                <button className="button" type="submit" disabled={loading}>
                  {loading ? (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span className="spinner" /> Analyzing…</span>) : 'Analyze'}
                </button>
                {error && <span style={{ color: '#ff6666', fontSize: 13 }}>Error: {error}</span>}
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-inner">
            <div className="section-title">Preview</div>
            {preview ? (
              <img className="preview" src={preview} alt="preview" />
            ) : (
              <div className="terminal" style={{ color: 'var(--muted)' }}>No image selected.</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-inner">
            <div className="section-title">Response</div>
            {response ? (
              <pre className="terminal">{response}</pre>
            ) : (
              <div className="terminal" style={{ color: 'var(--muted)' }}>Results will appear here.</div>
            )}
          </div>
        </div>
      </section>

      <div className="footer">Backend: {API_URL}/vision</div>
    </main>
  )
}
