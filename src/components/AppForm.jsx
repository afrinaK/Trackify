import {useState} from 'react';
import {CATS} from '../shared.js';
import {api} from '../api.js';
const DATES=[['publish_date','Circular publish date'],['deadline','Application deadline'],['exam_date','Exam date'],['interview_date','Interview date'],['viva_date','Viva date'],['joining_date','Joining date']];
const L=({t,children,full})=><label className={full?'full':''}>{t}{children}</label>;
export default function AppForm({init,onDone}){
 const [f,setF]=useState({...init,extra:init.extra||{}}),[err,setErr]=useState('');
 const set=(k,v)=>setF(p=>({...p,[k]:v})),ex=(k,v)=>setF(p=>({...p,extra:{...p.extra,[k]:v}}));
 const cat=CATS[f.category];
 const onCat=c=>setF(p=>({...p,category:c,status:CATS[c].statuses.includes(p.status)?p.status:CATS[c].statuses[0]}));
 const submit=async e=>{e.preventDefault();try{await api(f.id?`/applications/${f.id}`:'/applications',{method:f.id?'PUT':'POST',body:f});onDone()}catch(x){setErr(x.message)}};
 return(<form className="form" onSubmit={submit}>
  <L t="Category"><select value={f.category} onChange={e=>onCat(e.target.value)}>{Object.entries(CATS).map(([k,c])=><option key={k} value={k}>{c.label}</option>)}</select></L>
  <L t="Status"><select value={f.status} onChange={e=>set('status',e.target.value)}>{cat.statuses.map(s=><option key={s}>{s}</option>)}</select></L>
  <L t={f.category==='masters'?'University':f.category==='govt'?'Organization':'Company'}><input required value={f.org||''} onChange={e=>set('org',e.target.value)}/></L>
  <L t={f.category==='masters'?'Program':'Position'}><input required value={f.position||''} onChange={e=>set('position',e.target.value)}/></L>
  {DATES.map(([k,t])=><L key={k} t={t}><input type="date" value={f[k]||''} onChange={e=>set(k,e.target.value)}/></L>)}
  {cat.extra.map(([k,t,area])=><L key={k} t={t} full={!!area}>{area?<textarea rows={2} value={f.extra[k]||''} onChange={e=>ex(k,e.target.value)}/>:<input value={f.extra[k]||''} onChange={e=>ex(k,e.target.value)}/>}</L>)}
  <L t="Application link"><input type="url" value={f.link||''} onChange={e=>set('link',e.target.value)}/></L>
  <L t="Reference number"><input value={f.reference||''} onChange={e=>set('reference',e.target.value)}/></L>
  <L t="Follow-up notes" full><textarea rows={2} value={f.extra.followup_notes||''} onChange={e=>ex('followup_notes',e.target.value)}/></L>
  <L t="Personal notes" full><textarea rows={3} value={f.notes||''} onChange={e=>set('notes',e.target.value)}/></L>
  {!f.id&&<p className="muted full">Save first, then use the 📄 action to upload documents.</p>}
  {err&&<p className="err full">{err}</p>}
  <div className="full end"><button type="button" className="btn" onClick={()=>onDone(true)}>Cancel</button><button className="btn primary">Save application</button></div></form>);
}
