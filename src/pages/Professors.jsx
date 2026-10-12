import {useState} from 'react';
import {PROF_STATUSES,P_EMAILED,P_POSITIVE,P_WAITING} from '../shared.js';
import {api} from '../api.js';
import {useData} from '../context.jsx';
import {daysLeft,fmt} from '../lib.js';
import {Badge,Card,Modal} from '../components/ui.jsx';
const F=[['name','Professor name'],['email','Email'],['research_area','Research area'],['department','Department'],['university','University'],['country','Country']];
export default function Professors(){
 const {profs,reload}=useData();
 const [q,setQ]=useState(''),[country,setCountry]=useState(''),[uni,setUni]=useState(''),[area,setArea]=useState(''),[edit,setEdit]=useState(null),[err,setErr]=useState('');
 const opts=k=>[...new Set(profs.map(p=>p[k]).filter(Boolean))].sort();
 const rows=profs.filter(p=>(!country||p.country===country)&&(!uni||p.university===uni)&&(!area||p.research_area===area)&&`${p.name} ${p.email||''}`.toLowerCase().includes(q.toLowerCase()));
 const n=s=>profs.filter(p=>s.includes(p.status)).length;
 const stats=[['Contacted',n(P_EMAILED)],['Replies',n([...P_POSITIVE,'Rejected'])],['Positive replies',n(P_POSITIVE)],['Pending replies',n(P_WAITING)],['No response',n(['No Response'])]];
 const save=async e=>{e.preventDefault();try{await api(edit.id?`/professors/${edit.id}`:'/professors',{method:edit.id?'PUT':'POST',body:edit});setEdit(null);setErr('');reload()}catch(x){setErr(x.message)}};
 const log=async p=>{const note=prompt(`What did you send or discuss with ${p.name}?`);if(note!==null){await api(`/professors/${p.id}/contacts`,{method:'POST',body:{note}});reload()}};
 const del=async p=>{if(confirm(`Delete ${p.name}?`)){await api(`/professors/${p.id}`,{method:'DELETE'});reload()}};
 const sel=(v,set,k,t)=><select value={v} onChange={e=>set(e.target.value)}><option value="">{t}</option>{opts(k).map(o=><option key={o}>{o}</option>)}</select>;
 return(<div className="stack" style={{'--c1':'#2563eb','--c2':'#7c3aed'}}>
  <div className="between"><h1>🧑‍🏫 Professor outreach</h1><button className="btn primary" onClick={()=>setEdit({status:'Not Contacted'})}>+ Add professor</button></div>
  <div className="grid stats">{stats.map(([t,v])=><Card key={t}><div className="muted">{t}</div><div className="num">{v}</div></Card>)}</div>
  <div className="toolbar"><input placeholder="Search name or email…" value={q} onChange={e=>setQ(e.target.value)}/>{sel(country,setCountry,'country','All countries')}{sel(uni,setUni,'university','All universities')}{sel(area,setArea,'research_area','All research areas')}</div>
  <div className="tablewrap"><table><thead><tr><th>Professor</th><th>University</th><th>Country</th><th>Research area</th><th>Email</th><th>Status</th><th>Last contact</th><th>Next follow-up</th><th>Actions</th></tr></thead>
   <tbody>{rows.map(p=><tr key={p.id} className={p.next_followup&&daysLeft(p.next_followup)<=0&&P_WAITING.includes(p.status)?'hotrow':''}>
    <td><b>{p.name}</b></td><td>{p.university}</td><td>{p.country}</td><td>{p.research_area}</td><td>{p.email&&<a className="link" href={`mailto:${p.email}`}>{p.email}</a>}</td><td><Badge s={p.status}/></td><td className="nw">{fmt(p.last_contact)}</td><td className="nw">{fmt(p.next_followup)}</td>
    <td className="nw"><button className="icon" title="Edit" onClick={()=>setEdit(p)}>✏️</button><button className="icon" title="Log contact" onClick={()=>log(p)}>✉️</button><button className="icon" title="Delete" onClick={()=>del(p)}>🗑️</button></td></tr>)}
    {!rows.length&&<tr><td colSpan={9} className="empty">No professors yet. Add one to start tracking outreach.</td></tr>}</tbody></table></div>
  {edit&&<Modal title={edit.id?'Edit professor':'Add professor'} onClose={()=>setEdit(null)}><form className="form" onSubmit={save}>
   {F.map(([k,t])=><label key={k}>{t}<input required={k==='name'} type={k==='email'?'email':'text'} value={edit[k]||''} onChange={e=>setEdit({...edit,[k]:e.target.value})}/></label>)}
   <label>Contact status<select value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}>{PROF_STATUSES.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Last contact<input type="date" value={edit.last_contact||''} onChange={e=>setEdit({...edit,last_contact:e.target.value})}/></label>
   <label>Next follow-up<input type="date" value={edit.next_followup||''} onChange={e=>setEdit({...edit,next_followup:e.target.value})}/></label>
   <label className="full">Conversation notes<textarea rows={3} value={edit.notes||''} onChange={e=>setEdit({...edit,notes:e.target.value})}/></label>
   {err&&<p className="err full">{err}</p>}<div className="full end"><button type="button" className="btn" onClick={()=>setEdit(null)}>Cancel</button><button className="btn primary">Save professor</button></div></form></Modal>}
 </div>);
}
