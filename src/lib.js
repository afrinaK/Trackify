export const daysLeft=d=>d?Math.round((new Date(d.slice(0,10)+'T00:00:00')-new Date().setHours(0,0,0,0))/864e5):null;
export const fmt=d=>d?new Date(d.slice(0,10)+'T00:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):'—';
export const nextDays=a=>{const v=[a.deadline,a.exam_date,a.interview_date].map(daysLeft).filter(n=>n!==null&&n>=0);return v.length?Math.min(...v):null};
export const save=(name,type,text)=>{const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)};
const COLS=['category','org','position','publish_date','deadline','exam_date','interview_date','viva_date','joining_date','status','link','reference','notes'];
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
export const exportRows=(rows,kind)=>{
 if(kind==='json')return save('applications.json','application/json',JSON.stringify(rows,null,2));
 if(kind==='xls')return save('applications.xls','application/vnd.ms-excel',`<table><tr>${COLS.map(c=>`<th>${c}</th>`).join('')}</tr>${rows.map(r=>`<tr>${COLS.map(c=>`<td>${esc(r[c])}</td>`).join('')}</tr>`).join('')}</table>`);
 save('applications.csv','text/csv',[COLS,...rows.map(r=>COLS.map(c=>r[c]??''))].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'));
};
