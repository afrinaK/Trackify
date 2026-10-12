import {useState} from 'react';
import {api} from '../api.js';
import {useAuth,useData} from '../context.jsx';
import {exportRows,save} from '../lib.js';
import {Card} from '../components/ui.jsx';
export default function Settings(){
 const {user,setUser,theme,toggleTheme}=useAuth(),{apps,profs,reload}=useData(),[name,setName]=useState(user.name),[msg,setMsg]=useState('');
 const saveName=async()=>{try{await api('/me',{method:'PUT',body:{name}});setUser({...user,name});setMsg('Name saved.')}catch(x){setMsg(x.message)}};
 const avatar=async e=>{try{const fd=new FormData();fd.append('avatar',e.target.files[0]);const r=await api('/me/avatar',{method:'POST',form:fd});setUser({...user,avatar:r.avatar});setMsg('Picture updated.')}catch(x){setMsg(x.message)}};
 const imp=async e=>{try{const d=JSON.parse(await e.target.files[0].text());const r=await api('/import',{method:'POST',body:Array.isArray(d)?{applications:d}:d});await reload();setMsg(`Imported ${r.imported} records.`)}catch(x){setMsg('Import failed: '+x.message)}e.target.value=''};
 return(<div className="stack narrow"><h1>Account settings</h1>{msg&&<p className="muted">{msg}</p>}
  <Card title="Profile"><div className="toolbar"><input value={name} onChange={e=>setName(e.target.value)}/><button className="btn primary" onClick={saveName}>Save name</button></div>
   <p className="muted">{user.email}</p><label>Profile picture <input type="file" accept="image/*" onChange={avatar}/></label></Card>
  <Card title="Theme"><button className="btn" onClick={toggleTheme}>Switch to {theme==='dark'?'light':'dark'} mode</button></Card>
  <Card title="Export and backup"><div className="toolbar">
   <button className="btn" onClick={()=>exportRows(apps,'csv')}>CSV</button><button className="btn" onClick={()=>exportRows(apps,'xls')}>Excel</button>
   <button className="btn" onClick={()=>save('career-tracker-backup.json','application/json',JSON.stringify({applications:apps,professors:profs},null,2))}>JSON backup</button></div>
   <p className="muted">Restore a JSON backup (adds records; documents are not included):</p><input type="file" accept=".json" onChange={imp}/></Card></div>);
}
