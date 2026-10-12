import {useEffect,useState} from 'react';
import {Bar,BarChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {api} from '../api.js';
import {useAuth} from '../context.jsx';
import {Card} from '../components/ui.jsx';
export default function Admin(){
 const {user}=useAuth(),[d,setD]=useState(null),[err,setErr]=useState('');
 const load=()=>api('/admin/stats').then(setD).catch(x=>setErr(x.message));
 useEffect(()=>{load()},[]);
 const act=async(p)=>{try{await p;load()}catch(x){setErr(x.message)}};
 if(!d)return <p className="muted">{err||'Loading…'}</p>;
 return(<div className="stack"><h1>Admin</h1>{err&&<p className="err">{err}</p>}
  <div className="grid stats">{[['Users',d.users],['Applications',d.applications],['Professors',d.professors],['Documents',d.documents]].map(([t,n])=><Card key={t}><div className="muted">{t}</div><div className="num">{n}</div></Card>)}</div>
  <Card title="Applications by category"><div style={{height:220}}><ResponsiveContainer><BarChart data={d.byCategory}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="#6366f1" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></Card>
  <div className="tablewrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Applications</th><th>Joined</th><th>Actions</th></tr></thead>
   <tbody>{d.list.map(u=><tr key={u.id}><td><b>{u.name}</b></td><td>{u.email}</td><td>{u.role}</td><td>{u.apps}</td><td>{String(u.created_at).slice(0,10)}</td>
    <td>{u.id!==user.id&&<><button className="btn" onClick={()=>act(api(`/admin/users/${u.id}`,{method:'PUT',body:{role:u.role==='admin'?'user':'admin'}}))}>Make {u.role==='admin'?'user':'admin'}</button> <button className="btn danger" onClick={()=>confirm(`Delete ${u.name} and all their data?`)&&act(api(`/admin/users/${u.id}`,{method:'DELETE'}))}>Delete</button></>}</td></tr>)}</tbody></table></div></div>);
}
