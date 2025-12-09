import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function App() {
  const [form, setForm] = useState({
    phoneNumberId: '',
    verifyToken: '',
    permanentAccessToken: '',
    businessAccountId: '',
    appId: '',
    autoReplyEnabled: true,
    autoReplyText: 'Thanks for your message!'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    axios.get('/api/config').then(({ data }) => {
      if (mounted && data) {
        setForm(prev => ({ ...prev, ...data }))
      }
    }).finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const { data } = await axios.post('/api/config', form)
      setForm(prev => ({ ...prev, ...data }))
      setMessage('Saved!')
    } catch (err) {
      setMessage('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h2>WhatsApp Bot Config</h2>
      <form onSubmit={onSave} style={{ display: 'grid', gap: 12 }}>
        <TextInput label="Phone Number ID" name="phoneNumberId" value={form.phoneNumberId} onChange={onChange} />
        <TextInput label="Verify Token" name="verifyToken" value={form.verifyToken} onChange={onChange} />
        <TextInput label="Permanent Access Token" name="permanentAccessToken" value={form.permanentAccessToken} onChange={onChange} type="password" />
        <TextInput label="Business Account ID" name="businessAccountId" value={form.businessAccountId} onChange={onChange} />
        <TextInput label="App ID" name="appId" value={form.appId} onChange={onChange} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="autoReplyEnabled" checked={form.autoReplyEnabled} onChange={onChange} />
          Auto Reply Enabled
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <div>Auto Reply Text</div>
          <textarea name="autoReplyText" value={form.autoReplyText} onChange={onChange} rows={3} />
        </label>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button disabled={saving} type="submit">{saving ? 'Saving...' : 'Save'}</button>
          <span>{message}</span>
        </div>
      </form>

      <hr style={{ margin: '24px 0' }} />
      <section>
        <h3>Webhook Setup (Meta)</h3>
        <ol>
          <li>Expose your local backend: use <code>ngrok http 3000</code></li>
          <li>Set callback URL to: <code>https://YOUR-NGROK-DOMAIN/webhook</code></li>
          <li>Verify token must match the Verify Token above</li>
          <li>Subscribe to messages field</li>
        </ol>
      </section>
    </div>
  )
}

function TextInput({ label, name, value, onChange, type = 'text' }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <div>{label}</div>
      <input type={type} name={name} value={value || ''} onChange={onChange} />
    </label>
  )
}


