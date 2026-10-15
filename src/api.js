// Same api(path,{method,body,form}) interface the UI already uses, now backed by Supabase.
import {createClient} from '@supabase/supabase-js';
import {CATS,P_WAITING,isSubmitted} from './shared.js';
import {daysLeft} from './lib.js';
const area=()=>localStorage.getItem('ct_remember')==='0'?sessionStorage:localStorage;
export const supabase=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY,
 {auth:{storage:{getItem:k=>area().getItem(k),setItem:(k,v)=>area().setItem(k,v),removeItem:k=>area().removeItem(k)}}});
const sb=supabase;
const ok=r=>{if(r.error)throw new Error(r.error.message);return r.data};
const uid=async()=>(await sb.auth.getSession()).data.session.user.id;
const AF=['category','org','position','publish_date','deadline','exam_date','interview_date','viva_date','joining_date','link','reference','notes'];
const PF=['name','email','research_area','department','university','country','last_contact','next_followup','notes'];
const only=(b,keys)=>Object.fromEntries(keys.map(k=>[k,b[k]===''||b[k]===undefined?null:b[k]]));
const appRow=b=>{if(!CATS[b.category]||!b.org||!b.position)throw new Error('Category, organization and position are required.');
 return{...only(b,AF),status:b.status||CATS[b.category].statuses[0],extra:b.extra||{}}};
const profRow=b=>{if(!b.name)throw new Error('Professor name is required.');return{...only(b,PF),status:b.status||'Not Contacted'}};
const log=async t=>ok(await sb.from('activities').insert({text:t}));
const ext=n=>n.slice(n.lastIndexOf('.')).toLowerCase();
const today=()=>new Date().toISOString().slice(0,10);
const R={
 'GET /applications':async()=>ok(await sb.from('applications').select('*,documents(count)').order('created_at',{ascending:false}).order('id',{ascending:false})).map(({documents,...a})=>({...a,docs:documents?.[0]?.count||0})),
 'POST /applications':async(_,b)=>{const r=appRow(b);const d=ok(await sb.from('applications').insert(r).select('id').single());await log(`Added ${b.org} — ${b.position}`);return d},
 'PUT /applications/:id':async(id,b)=>{const r=appRow(b);const old=ok(await sb.from('applications').select('status').eq('id',id).single());
  ok(await sb.from('applications').update({...r,updated_at:new Date().toISOString()}).eq('id',id));
  if(old.status!==r.status){const t=`${b.org}: status changed to ${r.status}`;await log(t);ok(await sb.from('notifications').insert({text:t}))}return null},
 'POST /applications/:id/duplicate':async id=>{const a=ok(await sb.from('applications').select('*').eq('id',id).single());ok(await sb.from('applications').insert(appRow({...a,org:a.org+' (copy)'})));return null},
 'DELETE /applications/:id':async id=>{const docs=ok(await sb.from('documents').select('path').eq('application_id',id));
  if(docs.length)await sb.storage.from('documents').remove(docs.map(d=>d.path));ok(await sb.from('applications').delete().eq('id',id));return null},
 'GET /applications/:id/documents':async id=>ok(await sb.from('documents').select('id,kind,original_name,created_at').eq('application_id',id).order('id',{ascending:false})),
 'POST /applications/:id/documents':async(id,_,f)=>{const file=f.get('file');
  if(!file||file.size>10*1024*1024||!/\.(pdf|docx?|png|jpe?g|gif|webp)$/i.test(file.name))throw new Error('Upload a PDF, DOCX or image up to 10 MB.');
  const path=`${await uid()}/${crypto.randomUUID()}${ext(file.name)}`;
  const up=await sb.storage.from('documents').upload(path,file);if(up.error)throw new Error(up.error.message);
  ok(await sb.from('documents').insert({application_id:id,kind:f.get('kind')||'Additional',original_name:file.name,path}));return null},
 'DELETE /documents/:id':async id=>{const d=ok(await sb.from('documents').select('path').eq('id',id).single());await sb.storage.from('documents').remove([d.path]);ok(await sb.from('documents').delete().eq('id',id));return null},
 'GET /professors':async()=>ok(await sb.from('professors').select('*').order('created_at',{ascending:false}).order('id',{ascending:false})),
 'POST /professors':async(_,b)=>{ok(await sb.from('professors').insert(profRow(b)));return null},
 'PUT /professors/:id':async(id,b)=>{const r=profRow(b);const old=ok(await sb.from('professors').select('status').eq('id',id).single());
  ok(await sb.from('professors').update(r).eq('id',id));if(old.status!==r.status)await log(`Professor ${b.name}: ${r.status}`);return null},
 'DELETE /professors/:id':async id=>{ok(await sb.from('professors').delete().eq('id',id));return null},
 'POST /professors/:id/contacts':async(id,b)=>{const p=ok(await sb.from('professors').select('name').eq('id',id).single());
  ok(await sb.from('professor_contacts').insert({professor_id:id,note:b.note||''}));ok(await sb.from('professors').update({last_contact:today()}).eq('id',id));await log(`Contacted professor ${p.name}`);return null},
  'GET /email-templates':async()=>ok(await sb.from('email_templates').select('*').order('created_at',{ascending:false})),
 'POST /email-templates':async(_,b)=>{if(!b.title||!b.url)throw new Error('Title and link are required.');ok(await sb.from('email_templates').insert({title:b.title,url:b.url,category:b.category||null,notes:b.notes||null}));return null},
 'DELETE /email-templates/:id':async id=>{ok(await sb.from('email_templates').delete().eq('id',id));return null},
 'GET /activities':async()=>ok(await sb.from('activities').select('text,created_at').order('id',{ascending:false}).limit(30)),
 'GET /notifications':async()=>{const alerts=[];
  for(const a of ok(await sb.from('applications').select('org,status,deadline,exam_date,interview_date')))
   for(const [f,label] of [['deadline','deadline'],['exam_date','exam'],['interview_date','interview']]){
    if(!a[f]||(f==='deadline'&&isSubmitted(a)))continue;const d=daysLeft(a[f]);if(d>=0&&d<=7)alerts.push({text:`${a.org}: ${label}`,days:d})}
  for(const p of ok(await sb.from('professors').select('name,status,next_followup')))if(p.next_followup&&daysLeft(p.next_followup)<=0&&P_WAITING.includes(p.status))alerts.push({text:`Follow up with ${p.name}`,days:0});
  return{alerts:alerts.sort((a,b)=>a.days-b.days),updates:ok(await sb.from('notifications').select('id,text').eq('is_read',false).order('id',{ascending:false}).limit(20))}},
 'PUT /notifications/read':async()=>{ok(await sb.from('notifications').update({is_read:true}).eq('is_read',false));return null},
 'POST /import':async(_,b)=>{const a=(b.applications||[]).filter(x=>CATS[x.category]&&x.org&&x.position).map(appRow),p=(b.professors||[]).filter(x=>x.name).map(profRow);
  if(a.length)ok(await sb.from('applications').insert(a));if(p.length)ok(await sb.from('professors').insert(p));await log(`Imported ${a.length+p.length} records from backup`);return{imported:a.length+p.length}},
 'GET /me':async()=>ok(await sb.from('profiles').select('id,name,email,role,avatar,theme').eq('id',await uid()).single()),
 'PUT /me':async(_,b)=>{const p={};if(b.name)p.name=b.name;if(['light','dark'].includes(b.theme))p.theme=b.theme;ok(await sb.from('profiles').update(p).eq('id',await uid()));return null},
 'POST /me/avatar':async(_,__,f)=>{const file=f.get('avatar');
  if(!file||file.size>2e6||!/\.(png|jpe?g|gif|webp)$/i.test(file.name))throw new Error('Use a PNG, JPG, GIF or WebP up to 2 MB.');
  const u=await uid(),path=`${u}/${Date.now()}${ext(file.name)}`;const up=await sb.storage.from('avatars').upload(path,file);if(up.error)throw new Error(up.error.message);
  const avatar=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;ok(await sb.from('profiles').update({avatar}).eq('id',u));return{avatar}},
 'GET /admin/stats':async()=>{const [u,a,p,d]=await Promise.all([sb.from('profiles').select('id,name,email,role,created_at').order('created_at'),sb.from('applications').select('user_id,category'),
   sb.from('professors').select('id',{count:'exact',head:true}),sb.from('documents').select('id',{count:'exact',head:true})]);
  [u,a,p,d].forEach(r=>{if(r.error)throw new Error(r.error.message)});
  const cat={},per={};a.data.forEach(x=>{cat[x.category]=(cat[x.category]||0)+1;per[x.user_id]=(per[x.user_id]||0)+1});
  return{users:u.data.length,applications:a.data.length,professors:p.count,documents:d.count,byCategory:Object.entries(cat).map(([name,value])=>({name,value})),list:u.data.map(x=>({...x,apps:per[x.id]||0}))}},
 'PUT /admin/users/:id':async(id,b)=>{ok(await sb.rpc('admin_set_role',{uid:id,new_role:b.role}));return null},
 'DELETE /admin/users/:id':async id=>{ok(await sb.rpc('admin_delete_user',{uid:id}));return null},
};
export async function api(path,{method='GET',body,form}={}){
 const s=path.split('/').filter(Boolean),id=s.find(x=>/^(\d+|[0-9a-f-]{36})$/.test(x));
 const h=R[`${method} /${s.map(x=>x===id?':id':x).join('/')}`];if(!h)throw new Error(`Unknown request: ${method} ${path}`);
 return h(id,body,form);
}
export const fileBlob=async id=>{const d=ok(await sb.from('documents').select('path').eq('id',id).single());return ok(await sb.storage.from('documents').download(d.path))};
