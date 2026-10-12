import {Bar,BarChart,CartesianGrid,Cell,Line,LineChart,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {CATS,KIND_COLOR,P_EMAILED,P_POSITIVE,isAccepted,isPending,isRejected,statusKind} from '../shared.js';
import {Card} from './ui.jsx';
const Chart=({title,children,empty})=><Card title={title}>{empty?<p className="muted">No data yet.</p>:<div style={{height:240}}><ResponsiveContainer>{children}</ResponsiveContainer></div>}</Card>;
export default function Charts({apps,profs=[]}){
 const byCat=Object.entries(CATS).map(([k,c])=>({name:c.short,value:apps.filter(a=>a.category===k).length,fill:c.c1}));
 const st={};apps.forEach(a=>st[a.status]=(st[a.status]||0)+1);
 const byStatus=Object.entries(st).map(([name,value])=>({name,value,fill:KIND_COLOR[statusKind(name)]}));
 const trend=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5+i);const k=d.toISOString().slice(0,7);
  return{name:d.toLocaleString(undefined,{month:'short'}),Applications:apps.filter(a=>String(a.created_at).startsWith(k)).length}});
 const acc=apps.filter(isAccepted).length,rej=apps.filter(isRejected).length,pen=apps.filter(isPending).length;
 const success=[{name:'Accepted',value:acc,fill:'#10b981'},{name:'Rejected',value:rej,fill:'#ef4444'},{name:'Pending',value:pen,fill:'#f59e0b'}].filter(x=>x.value);
 const rate=acc+rej?Math.round(acc/(acc+rej)*100):0;
 const ct={};apps.forEach(a=>{const c=a.extra?.country;if(c)ct[c]=(ct[c]||0)+1});
 const byCountry=Object.entries(ct).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,8);
 const has=s=>profs.filter(p=>s.includes(p.status)).length;
 const pipeline=[['Listed',profs.length],['Email Drafted',profs.filter(p=>p.status!=='Not Contacted').length],['Email Sent',has(P_EMAILED)],['Replied',has([...P_POSITIVE,'Rejected'])],['Meeting Scheduled',has(['Meeting Scheduled','Interview Scheduled','Accepted For Supervision'])],['Supervision Accepted',has(['Accepted For Supervision'])]].map(([name,value])=>({name,value}));
 const grid=<CartesianGrid strokeDasharray="3 3" opacity={.2}/>;
 return(<div className="grid charts">
  <Chart title="Applications by category"><BarChart data={byCat}>{grid}<XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" name="Applications" radius={[6,6,0,0]}>{byCat.map(d=><Cell key={d.name} fill={d.fill}/>)}</Bar></BarChart></Chart>
  <Chart title="Status distribution" empty={!byStatus.length}><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={2}>{byStatus.map(d=><Cell key={d.name} fill={d.fill}/>)}</Pie><Tooltip/></PieChart></Chart>
  <Chart title="Monthly application trend"><LineChart data={trend}>{grid}<XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Line dataKey="Applications" stroke="#6366f1" strokeWidth={3}/></LineChart></Chart>
  <Chart title={`Success rate: ${rate}%`} empty={!success.length}><PieChart><Pie data={success} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>{success.map(d=><Cell key={d.name} fill={d.fill}/>)}</Pie><Tooltip/></PieChart></Chart>
  <Chart title="Applications by country" empty={!byCountry.length}><BarChart data={byCountry} layout="vertical">{grid}<XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="name" width={80}/><Tooltip/><Bar dataKey="value" fill="#7c3aed" radius={[0,6,6,0]}/></BarChart></Chart>
  {profs.length>0&&<Chart title="Professor contact pipeline"><BarChart data={pipeline}>{grid}<XAxis dataKey="name" interval={0} tick={{fontSize:11}}/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="#2563eb" radius={[6,6,0,0]}/></BarChart></Chart>}
 </div>);
}
