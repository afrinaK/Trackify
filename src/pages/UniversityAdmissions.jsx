import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {api} from '../api.js';
import {daysLeft,fmt} from '../lib.js';
import {Days,Modal} from '../components/ui.jsx';

const C1='#0891b2',C2='#059669';
const STATUS={not_applied:['Not applied','yellow'],applied:['Applied','green'],missed:['Missed','red']};
const EMPTY={university:'',application_starts:'',apply_deadline:'',test_date:'',link:'',status:'not_applied',admit_card_downloaded:false};
const up=d=>{const n=daysLeft(d);return n!==null&&n>=0};
const VIEWS=[['all','All Universities','📋'],['deadlines','Upcoming Deadlines','⏰'],['exams','Upcoming Exams','📝'],['applied','Applied','📤'],['admit','Admit Card Pending','🎫']];
const FILTER={
 all:()=>true,
 deadlines:r=>up(r.apply_deadline)&&r.status!=='applied',
 exams:r=>up(r.test_date),
 applied:r=>r.status==='applied',
 admit:r=>r.status==='applied'&&!r.admit_card_downloaded};

export default function UniversityAdmissions(){
 const [rows,setRows]=useState([]),[view,setView]=useState('all'),[col,setCol]=useState(()=>innerWidth<800);
 const [q,setQ]=useState(''),[st,setSt]=useState(''),[edit,setEdit]=useState(null);
 const load=async()=>setRows(await api('/universities').catch(()=>[]));
 useEffect(()=>{load()},[]);
 const shown=rows.filter(FILTER[view]).filter(r=>(!st||r.status===st)&&r.university.toLowerCase().includes(q.toLowerCase()));
 const set=(k,v)=>setEdit(e=>({...e,[k]:v}));
 const save=async e=>{e.preventDefault();
  try{await api(edit.id?`/universities/${edit.id}`:'/universities',{method:edit.id?'PUT':'POST',body:edit});setEdit(null);load()}
  catch(err){alert(err.message)}};
 const patch=async(r,p)=>{await api(`/universities/${r.id}`,{method:'PUT',body:{...r,...p}});load()};
 const del=async r=>{if(confirm('Delete this entry?')){await api(`/universities/${r.id}`,{method:'DELETE'});load()}}; return(<div className="stack" style={{'--c1':C1,'--c2':C2}}>
  <div className="hero" style={{background:`linear-gradient(135deg,${C1},${C2})`}}><div><Link to="/">← Dashboard</Link><h1>🏫 Universities</h1></div><b>{rows.length} total</b></div>
  <div className="layout">
   <motion.aside className="side" animate={{width:col?56:230}} transition={{duration:.2}}>
    <button className="side-item" onClick={()=>setCol(!col)} aria-label="Toggle sidebar">{col?'»':'« Collapse'}</button>
    {VIEWS.map(([k,t,i])=><button key={k} title={t} className={`side-item ${view===k?'on':''}`} onClick={()=>setView(k)}><span>{i}</span>{!col&&t}</button>)}
   </motion.aside>
   <section className="main stack">
    <div className="toolbar">
     <input placeholder="Search university…" value={q} onChange={e=>setQ(e.target.value)}/>
     <select value={st} onChange={e=>setSt(e.target.value)}><option value="">All statuses</option>{Object.entries(STATUS).map(([v,[l]])=><option key={v} value={v}>{l}</option>)}</select>
     <button className="btn primary" onClick={()=>setEdit({...EMPTY})}>+ Add university</button></div>
    <div className="tablewrap"><table>
     <thead><tr><th>University</th><th>Application start</th><th>Application deadline</th><th>Exam date</th><th>Circular</th><th>Apply status</th><th>Admit card</th><th>Actions</th></tr></thead>
     <tbody>{shown.map(r=>{const n=daysLeft(r.apply_deadline);return(<tr key={r.id} className={r.status!=='applied'&&n!==null&&n>=0&&n<=7?'hotrow':''}>
      <td><b>{r.university}</b></td>
      <td className="nw">{fmt(r.application_starts)}</td>
      <td className="nw">{fmt(r.apply_deadline)} <Days n={n}/></td>
      <td className="nw">{fmt(r.test_date)}</td>
      <td>{r.link?<a href={r.link} target="_blank" rel="noreferrer">Open ↗</a>:'—'}</td>
      <td><select className={`badge sel ${STATUS[r.status]?.[1]||''}`} value={r.status} onChange={e=>patch(r,{status:e.target.value})}>{Object.entries(STATUS).map(([v,[l]])=><option key={v} value={v}>{l}</option>)}</select></td>
      <td><button className={`badge sel ${r.admit_card_downloaded?'green':'yellow'}`} style={{border:0,cursor:'pointer'}} onClick={()=>patch(r,{admit_card_downloaded:!r.admit_card_downloaded})}>{r.admit_card_downloaded?'Downloaded':'Pending'}</button></td>
      <td className="nw"><button className="icon" title="Edit" onClick={()=>setEdit({...EMPTY,...r})}>✏️</button><button className="icon" title="Delete" onClick={()=>del(r)}>🗑️</button></td></tr>)})}
      {!shown.length&&<tr><td colSpan={8} className="empty">Nothing here yet. Use “Add university” to start tracking.</td></tr>}</tbody></table></div>
    <span className="muted">{shown.length} result{shown.length===1?'':'s'}</span>
   </section></div>
  {edit&&<Modal title={edit.id?'Edit university':'New university'} onClose={()=>setEdit(null)}>
   <form className="form" onSubmit={save}>
    <label className="full">University name<input required value={edit.university} onChange={e=>set('university',e.target.value)}/></label>
    <label>Application start<input type="date" value={edit.application_starts||''} onChange={e=>set('application_starts',e.target.value)}/></label>
    <label>Application deadline<input type="date" value={edit.apply_deadline||''} onChange={e=>set('apply_deadline',e.target.value)}/></label>
    <label>Exam date<input type="date" value={edit.test_date||''} onChange={e=>set('test_date',e.target.value)}/></label>
    <label>Circular link<input type="url" value={edit.link||''} onChange={e=>set('link',e.target.value)}/></label>
    <label>Apply status<select value={edit.status} onChange={e=>set('status',e.target.value)}>{Object.entries(STATUS).map(([v,[l]])=><option key={v} value={v}>{l}</option>)}</select></label>
    <label className="check"><input type="checkbox" checked={!!edit.admit_card_downloaded} onChange={e=>set('admit_card_downloaded',e.target.checked)}/> Admit card downloaded</label>
    <div className="end full"><button type="button" className="btn" onClick={()=>setEdit(null)}>Cancel</button><button className="btn primary">Save</button></div>
   </form></Modal>}
 </div>);
}