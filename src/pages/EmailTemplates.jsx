import { useEffect, useState } from "react";
import { api } from "../api.js";

const CATEGORIES = ["Professor outreach", "Job application", "Follow-up", "Thank you", "Other"];
const EMPTY = { title: "", url: "", category: CATEGORIES[0], notes: "" };

export default function EmailTemplates() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  async function load() {
    try {
      setItems(await api("/email-templates"));
    } catch (x) {
      setError(x.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onAdd(e) {
    e.preventDefault();
    setError("");
    let url = form.url.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setSaving(true);
    try {
      await api("/email-templates", { method: "POST", body: { ...form, title: form.title.trim(), url } });
      setForm(EMPTY);
      load();
    } catch (x) {
      setError(x.message);
    }
    setSaving(false);
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this template link?")) return;
    try {
      await api(`/email-templates/${id}`, { method: "DELETE" });
      setItems(items.filter((i) => i.id !== id));
    } catch (x) {
      setError(x.message);
    }
  }

  async function onCopy(item) {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const visible = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="stack">
      <h1>Email templates</h1>

      <form className="card form" onSubmit={onAdd}>
        <label>Title
          <input name="title" value={form.title} onChange={onChange} required />
        </label>
        <label>Link
          <input name="url" placeholder="Google Doc, Notion, Gmail draft..." value={form.url} onChange={onChange} required />
        </label>
        <label>Category
          <select name="category" value={form.category} onChange={onChange}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Notes
          <input name="notes" value={form.notes} onChange={onChange} />
        </label>
        {error && <p className="err full">{error}</p>}
        <div className="full end">
          <button className="btn primary" disabled={saving}>{saving ? "Saving..." : "Save template"}</button>
        </div>
      </form>

      <div className="toolbar">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} className={filter === c ? "btn primary" : "btn"} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="empty">No template links yet. Add one above.</p>
        ) : (
          visible.map((item) => (
            <div className="li" key={item.id}>
              <div>
                <a className="link" href={item.url} target="_blank" rel="noreferrer">{item.title}</a>{" "}
                <span className="badge blue">{item.category}</span>
                {item.notes && <p className="muted">{item.notes}</p>}
              </div>
              <div className="nw">
                <button className="btn" onClick={() => onCopy(item)}>{copiedId === item.id ? "Copied" : "Copy link"}</button>{" "}
                <button className="btn danger" onClick={() => onDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
