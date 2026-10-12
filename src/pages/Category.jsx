import {useState} from 'react';
import {Link,Navigate,useParams,useSearchParams} from 'react-router-dom';
import {motion} from 'framer-motion';
import {CATS,isAccepted,isPending,isRejected,isSubmitted,statusKind} from '../shared.js';
import {api} from '../api.js';
import {useData} from '../context.jsx';
import {daysLeft,exportRows,fmt,nextDays} from '../lib.js';
import {Days,Modal} from '../components/ui.jsx';
import AppForm from '../components/AppForm.jsx';
import Docs from '../components/Docs.jsx';
import Charts from '../components/Charts.jsx';
const VIEWS=[['all','All Applications','📋'],['deadlines','Upcoming Deadlines','⏰'],['exams','Upcoming Exams','📝'],['interviews','Upcoming Interviews','🎤'],['submitted','Submitted','📤'],['pending','Pending','⏳'],['accepted','Accepted','✅'],['rejected','Rejected','❌'],['documents','Documents','📎'],['analytics','Analytics','📊']];
const up=d=>{const n=daysLeft(d);return n!==null&&n>=0};
const FILTER={all:()=>true,deadlines:a=>up(a.deadline)&&!isSubmitted(a),exams:a=>up(a.exam_date),interviews:a=>up(a.interview_date),submitted:isSubmitted,pending:isPending,accepted:isAccepted,rejected:isRejected,documents:a=>a.docs>0,analytics:()=>true};
const PAGE=8;
export default function Category(){const {cat}=useParams();return CATS[cat]?<Inner key={cat} cat={cat}/>:<Navigate to="/" replace/>}
function Inner({cat}){
 const c=CATS[cat],[sp,setSp]=useSearchParams(),view=sp.get('v')||'all',{apps,reload}=useData();
 const [q,setQ]=useState(''),[st,setSt]=useState(''),[col,setCol]=useState(()=>innerWidth<800),[pg,setPg]=useState(0),[sort,setSort]=useState(['deadline',1]);
 const [edit,setEdit]=useState(null),[docs,setDocs]=useState(null),[sel,setSel]=useState(new Set());
 const mine=apps.filter(a=>a.category===cat);
 const rows=mine.filter(FILTER[view]||FILTER.all).filter(a=>(!st||a.status===st)&&`${a.org} ${a.position} ${a.reference||''}`.toLowerCase().includes(q.toLowerCase()));
 const val=(a,k)=>k==='days'?nextDays(a)??1e9:k==='status'?c.statuses.indexOf(a.status):a[k]||'\uffff';
 const sorted=[...rows].sort((x,y)=>{const p=val(x,sort[0]),r=val(y,sort[0]);return(p<r?-1:p>r?1:0)*sort[1]});
 const pages=Math.max(1,Math.ceil(sorted.length/PAGE)),cur=Math.min(pg,pages-1),page=sorted.slice(cur*PAGE,cur*PAGE+PAGE);
 const upd=async(a,patch)=>{await api(`/applications/${a.id}`,{method:'PUT',body:{...a,...patch}});reload()};
 const bulkStatus=async s=>{await Promise.all(mine.filter(a=>sel.has(a.id)).map(a=>api(`/applications/${a.id}`,{method:'PUT',body:{...a,status:s}})));setSel(new Set());reload()};
 const del=async ids=>{if(confirm(`Delete ${ids.length} application(s) and their documents?`)){await Promise.all(ids.map(id=>api(`/applications/${id}`,{method:'DELETE'})));setSel(new Set());reload()}};
 const dup=async a=>{await api(`/applications/${a.id}/duplicate`,{method:'POST'});reload()};
 const toggle=id=>setSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n});
 const H=(k,t)=><th className="sort" onClick={()=>setSort(s=>[k,s[0]===k?-s[1]:1])}>{t}{sort[0]===k?(sort[1]>0?' ▲':' ▼'):''}</th>;
 return(<div className="stack" style={{'--c1':c.c1,'--c2':c.c2}}>
  <div className="hero" style={{background:`linear-gradient(135deg,${c.c1},${c.c2})`}}><div><Link to="/">← Dashboard</Link><h1>{c.icon} {c.label}</h1></div><b>{mine.length} total</b></div>
  <div className="layout">
   <motion.aside className="side" animate={{width:col?56:230}} transition={{duration:.2}}>
    <button className="side-item" onClick={()=>setCol(!col)} aria-label="Toggle sidebar">{col?'»':'« Collapse'}</button>
    {VIEWS.map(([k,t,i])=><button key={k} title={t} className={`side-item ${view===k?'on':''}`} onClick={()=>{setSp({v:k});setSel(new Set())}}><span>{i}</span>{!col&&t}</button>)}
   </motion.aside>
   <section className="main stack">
    {view==='analytics'?<Charts apps={mine}/>:<>
     <div className="toolbar">
      <input placeholder="Search organization, position, reference…" value={q} onChange={e=>setQ(e.target.value)}/>
      <select value={st} onChange={e=>setSt(e.target.value)}><option value="">All statuses</option>{c.statuses.map(s=><option key={s}>{s}</option>)}</select>
      <select value="" onChange={e=>exportRows(sorted,e.target.value)}><option value="" disabled>Export…</option><option value="csv">CSV</option><option value="xls">Excel</option><option value="json">JSON</option></select>
      <button className="btn primary" onClick={()=>setEdit({category:cat,status:c.statuses[0],extra:{}})}>+ Add new application</button></div>
     {sel.size>0&&<div className="toolbar bulk"><b>{sel.size} selected</b>
      <select value="" onChange={e=>bulkStatus(e.target.value)}><option value="" disabled>Set status…</option>{c.statuses.map(s=><option key={s}>{s}</option>)}</select>
      <button className="btn danger" onClick={()=>del([...sel])}>Delete selected</button></div>}
     <div className="tablewrap"><table>
      <thead><tr><th><input type="checkbox" checked={page.length>0&&page.every(a=>sel.has(a.id))} onChange={e=>setSel(e.target.checked?new Set(page.map(a=>a.id)):new Set())}/></th>
       {H('org',cat==='masters'?'University':'Organization')}{H('position',cat==='masters'?'Program':'Position')}{H('deadline','Deadline')}{H('exam_date','Exam')}{H('interview_date','Interview')}{H('status','Status')}<th>Docs</th>{H('days','Days left')}<th>Actions</th></tr></thead>
      <tbody>{page.map(a=>{const n=nextDays(a);return(<tr key={a.id} className={n!==null&&n<=7?'hotrow':''}>
       <td><input type="checkbox" checked={sel.has(a.id)} onChange={()=>toggle(a.id)}/></td>
       <td><b>{a.org}</b></td><td>{a.position}</td><td className="nw">{fmt(a.deadline)}</td><td className="nw">{fmt(a.exam_date)}</td><td className="nw">{fmt(a.interview_date)}</td>
       <td><select className={`badge sel ${statusKind(a.status)}`} value={a.status} onChange={e=>upd(a,{status:e.target.value})}>{c.statuses.map(s=><option key={s}>{s}</option>)}</select></td>
       <td><button className="link" onClick={()=>setDocs(a)}>📎 {a.docs}</button></td><td><Days n={n}/></td>
       <td className="nw"><button className="icon" title="Edit / details" onClick={()=>setEdit(a)}>✏️</button><button className="icon" title="Documents" onClick={()=>setDocs(a)}>📄</button><button className="icon" title="Duplicate" onClick={()=>dup(a)}>⧉</button><button className="icon" title="Delete" onClick={()=>del([a.id])}>🗑️</button></td></tr>)})}
       {!page.length&&<tr><td colSpan={10} className="empty">Nothing here yet. Use “Add new application” to start tracking.</td></tr>}</tbody></table></div>
     <div className="between"><span className="muted">{sorted.length} result{sorted.length===1?'':'s'}</span>
      <div><button className="btn" disabled={cur===0} onClick={()=>setPg(cur-1)}>Prev</button> <span>{cur+1} / {pages}</span> <button className="btn" disabled={cur>=pages-1} onClick={()=>setPg(cur+1)}>Next</button></div></div></>}
   </section></div>
  {edit&&<Modal title={edit.id?'Edit application':'New application'} onClose={()=>setEdit(null)}><AppForm key={edit.id||'new'} init={edit} onDone={saved=>{setEdit(null);if(!saved)reload()}}/></Modal>}
  {docs&&<Docs app={docs} onClose={()=>setDocs(null)} reload={reload}/>}
 </div>);
}
