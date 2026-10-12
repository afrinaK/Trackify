import {Link} from 'react-router-dom';
import {CATS,P_EMAILED,P_POSITIVE,isAccepted,isPending,isRejected,isSubmitted} from '../shared.js';
import {useData} from '../context.jsx';
import {daysLeft,fmt} from '../lib.js';
import {Badge,Card,Days} from '../components/ui.jsx';
import Charts from '../components/Charts.jsx';
const up=d=>{const n=daysLeft(d);return n!==null&&n>=0};
function List({title,items,field,empty}){
 return <Card title={title}>{items.length?items.map(a=><Link key={a.id} to={`/c/${a.category}`} className="li">
  <div><b>{a.org}</b><div className="muted">{a.position} · {fmt(a[field])}</div></div><Days n={daysLeft(a[field])}/></Link>):<p className="muted">{empty}</p>}</Card>;
}
export default function Dashboard(){
 const {apps,profs,acts,loading}=useData();
 const by=(f,n=5)=>f==='deadline'?apps.filter(a=>up(a.deadline)&&!isSubmitted(a)).sort((x,y)=>x.deadline>y.deadline?1:-1).slice(0,n):apps.filter(a=>up(a[f])).sort((x,y)=>x[f]>y[f]?1:-1).slice(0,n);
 const inCat=k=>apps.filter(a=>a.category===k).length;
 const stats=[['Total applications',apps.length],['Higher studies',inCat('masters')],['Government jobs',inCat('govt')],['Private jobs',inCat('private')],['Submitted',apps.filter(isSubmitted).length],['Pending',apps.filter(isPending).length],['Accepted',apps.filter(isAccepted).length],['Rejected',apps.filter(isRejected).length],
  ['Interviews scheduled',apps.filter(a=>/Interview/.test(a.status)).length],['Professors contacted',profs.filter(p=>P_EMAILED.includes(p.status)).length],['Professor replies',profs.filter(p=>[...P_POSITIVE,'Rejected'].includes(p.status)).length]];
 if(loading)return <p className="muted">Loading your data…</p>;
 return(<div className="stack">
  <h1>Dashboard</h1>
  <div className="grid three">{Object.entries(CATS).map(([k,c])=><Link key={k} to={`/c/${k}`} className="cat" style={{background:`linear-gradient(135deg,${c.c1},${c.c2})`}}>
   <span className="big">{c.icon}</span><h2>{c.label}</h2><p>{c.blurb}</p><b>{inCat(k)} application{inCat(k)===1?'':'s'}</b></Link>)}</div>
  <div className="grid three"><List title="Upcoming exams" items={by('exam_date')} field="exam_date" empty="No exams scheduled."/><List title="Upcoming deadlines" items={by('deadline')} field="deadline" empty="No open deadlines."/><List title="Upcoming interviews" items={by('interview_date')} field="interview_date" empty="No interviews scheduled."/></div>
  <div className="grid stats">{stats.map(([t,n])=><Card key={t}><div className="muted">{t}</div><div className="num">{n}</div></Card>)}</div>
  <Charts apps={apps} profs={profs}/>
  <Card title="Recent activity"><div className="grid three">
   <div><h4>Newly added</h4>{apps.slice(0,4).map(a=><p key={a.id}>{CATS[a.category].icon} {a.org}</p>)}{!apps.length&&<p className="muted">Nothing yet.</p>}</div>
   <div><h4>Updated statuses</h4>{acts.filter(a=>/status changed/.test(a.text)).slice(0,4).map((a,i)=><p key={i}>{a.text}</p>)}{!acts.some(a=>/status changed/.test(a.text))&&<p className="muted">No status changes yet.</p>}</div>
   <div><h4>Professor communications</h4>{profs.filter(p=>p.last_contact).sort((x,y)=>x.last_contact<y.last_contact?1:-1).slice(0,4).map(p=><p key={p.id}>{p.name} <span className="muted">· {fmt(p.last_contact)}</span> <Badge s={p.status}/></p>)}{!profs.some(p=>p.last_contact)&&<p className="muted">No contact logged yet.</p>}</div></div></Card>
 </div>);
}
