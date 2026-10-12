import {useEffect,useState} from 'react';
import {DOC_KINDS} from '../shared.js';
import {api,fileBlob} from '../api.js';
import {Modal} from './ui.jsx';
export default function Docs({app,onClose,reload}){
 const [docs,setDocs]=useState([]),[kind,setKind]=useState(DOC_KINDS[0]),[err,setErr]=useState('');
 const load=()=>api(`/applications/${app.id}/documents`).then(setDocs);
 useEffect(()=>{load()},[]);
 const upload=async e=>{const file=e.target.files[0];if(!file)return;const fd=new FormData();fd.append('kind',kind);fd.append('file',file);
  try{setErr('');await api(`/applications/${app.id}/documents`,{method:'POST',form:fd});await load();reload()}catch(x){setErr(x.message)}e.target.value=''};
 const preview=async d=>{const win=window.open('','_blank');win.location=URL.createObjectURL(await fileBlob(d.id))};
 const download=async d=>{const a=document.createElement('a');a.href=URL.createObjectURL(await fileBlob(d.id));a.download=d.original_name;a.click()};
 const del=async d=>{if(confirm(`Delete ${d.original_name}?`)){await api(`/documents/${d.id}`,{method:'DELETE'});await load();reload()}};
 return(<Modal title={`${app.org} — documents`} onClose={onClose}>
  <div className="toolbar"><select value={kind} onChange={e=>setKind(e.target.value)}>{DOC_KINDS.map(k=><option key={k}>{k}</option>)}</select><input type="file" accept=".pdf,.doc,.docx,image/*" onChange={upload}/></div>
  {err&&<p className="err">{err}</p>}
  {docs.map(d=><div key={d.id} className="doc"><span>📎 {d.original_name}<small className="muted"> · {d.kind}</small></span>
   <span><button className="icon" title="Preview" onClick={()=>preview(d)}>👁</button><button className="icon" title="Download" onClick={()=>download(d)}>⬇️</button><button className="icon" title="Delete" onClick={()=>del(d)}>🗑️</button></span></div>)}
  {!docs.length&&<p className="muted">No documents yet. PDF, DOCX or images up to 10 MB.</p>}</Modal>);
}
