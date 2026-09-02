import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { LayoutDashboard, IndianRupee, ReceiptText, Wallet, Settings, Plus, Trash2, Pencil, Download, Search } from "lucide-react";

const seedIncome = [
  {id:1,date:"2026-09-01",type:"Income",category:"Donation",party:"Ramesh",mode:"UPI",amount:10000,ref:"UPI001",remarks:"Festival donation"},
  {id:2,date:"2026-09-01",type:"Income",category:"Sponsorship",party:"ABC Traders",mode:"Bank",amount:25000,ref:"NEFT001",remarks:"Main sponsor"},
];
const seedExpense = [
  {id:3,date:"2026-09-01",type:"Expense",category:"Decoration",party:"Sri Decorations",mode:"Cash",amount:5000,ref:"EXP001",remarks:"Pandal decoration"},
  {id:4,date:"2026-09-02",type:"Expense",category:"Pooja Materials",party:"Temple Stores",mode:"UPI",amount:2500,ref:"EXP002",remarks:"Pooja items"},
];

const incomeCats=["Donation","Sponsorship","Subscription","Member Contribution","Advertisement","Prasadam Collection","Cultural Program Income","Other Income"];
const expenseCats=["Decoration","Idol","Pandal","Electrical","Sound System","Lighting","Pooja Materials","Prasadam/Food","Cultural Programs","Transportation","Printing","Advertisement","Cleaning","Security","Labour","Miscellaneous","Other Expenses"];
const modes=["Cash","UPI","Bank","Cheque","Other"];

function money(n){ return "₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2}); }
function downloadCSV(rows,name){
  const headers=["Date","Type","Category","Party/Donor","Payment Mode","Amount","Reference","Remarks"];
  const csv=[headers,...rows.map(r=>[r.date,r.type,r.category,r.party,r.mode,r.amount,r.ref,r.remarks])]
    .map(x=>x.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=name; a.click();
}

export default function GanapathiMandal(){
 const [page,setPage]=useState("Dashboard");
 const [opening,setOpening]=useState(50000);
 const [mandal,setMandal]=useState("Sri Ganapathi Seva Mandal");
 const [festivalYear,setFestivalYear]=useState("2026");
 const [tx,setTx]=useState([...seedIncome,...seedExpense]);
 const [query,setQuery]=useState("");
 const [modal,setModal]=useState(null);
 const [editing,setEditing]=useState(null);

 const income=useMemo(()=>tx.filter(x=>x.type==="Income").reduce((a,x)=>a+Number(x.amount),0),[tx]);
 const expense=useMemo(()=>tx.filter(x=>x.type==="Expense").reduce((a,x)=>a+Number(x.amount),0),[tx]);
 const balance=opening+income-expense;
 const filtered=tx.filter(x=>Object.values(x).join(" ").toLowerCase().includes(query.toLowerCase()));
 const categoryData=[...expenseCats].map(c=>({name:c,value:tx.filter(x=>x.type==="Expense"&&x.category===c).reduce((a,x)=>a+Number(x.amount),0)})).filter(x=>x.value);
 const monthData=[{name:"Sep 2026",Income:income,Expense:expense}];

 function save(form){
   const item={...form,id:editing?.id??Date.now(),amount:Number(form.amount)};
   setTx(editing?tx.map(x=>x.id===editing.id?item:x):[...tx,item]);
   setModal(null);setEditing(null);
 }
 function remove(id){if(confirm("Delete this transaction?"))setTx(tx.filter(x=>x.id!==id));}

 return <div className="min-h-screen bg-slate-50 text-slate-900">
  <header className="bg-white border-b sticky top-0 z-20">
   <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
    <div><h1 className="text-xl font-bold">{mandal}</h1><p className="text-xs text-slate-500">Ganapathi Festival Accounts • {festivalYear}</p></div>
    <button onClick={()=>setModal({type:"Income"})} className="bg-orange-600 text-white px-4 py-2 rounded-xl flex gap-2 items-center"><Plus size={18}/> Add Income</button>
   </div>
  </header>
  <div className="max-w-7xl mx-auto flex">
   <aside className="w-56 hidden md:block p-4">
    {[
      ["Dashboard",LayoutDashboard],["Income",IndianRupee],["Expenses",ReceiptText],["Transactions",Wallet],["Balance Sheet",ReceiptText],["Reports",Download],["Settings",Settings]
    ].map(([n,I])=><button key={n} onClick={()=>setPage(n)} className={`w-full flex gap-3 items-center px-3 py-3 rounded-xl mb-1 text-sm ${page===n?"bg-orange-100 text-orange-700 font-semibold":"hover:bg-white"}`}><I size={18}/>{n}</button>)}
   </aside>
   <main className="flex-1 p-5">
    {page==="Dashboard"&&<Dashboard income={income} expense={expense} balance={balance} tx={tx} categoryData={categoryData} monthData={monthData}/>}
    {["Income","Expenses"].includes(page)&&<TransactionPage type={page==="Income"?"Income":"Expense"} rows={filtered} query={query} setQuery={setQuery} add={()=>setModal({type:page==="Income"?"Income":"Expense"})} edit={r=>{setEditing(r);setModal({type:r.type})}} remove={remove} exportRows={()=>downloadCSV(filtered,`${page}_Register_${festivalYear}.csv`)}/>}
    {page==="Transactions"&&<TransactionPage type="All" rows={filtered} query={query} setQuery={setQuery} add={()=>setModal({type:"Income"})} edit={r=>{setEditing(r);setModal({type:r.type})}} remove={remove} exportRows={()=>downloadCSV(filtered,`Transaction_Register_${festivalYear}.csv`)}/>}
    {page==="Balance Sheet"&&<BalanceSheet opening={opening} income={income} expense={expense} balance={balance} tx={tx}/>}
    {page==="Reports"&&<Reports tx={tx} income={income} expense={expense} balance={balance} opening={opening} exportRows={()=>downloadCSV(tx,`Ganapathi_Festival_${festivalYear}.csv`)}/>}
    {page==="Settings"&&<SettingsPage mandal={mandal} setMandal={setMandal} festivalYear={festivalYear} setFestivalYear={setFestivalYear} opening={opening} setOpening={setOpening}/>}
   </main>
  </div>
  {modal&&<EntryModal type={modal.type} initial={editing} onClose={()=>{setModal(null);setEditing(null)}} onSave={save}/>}
 </div>
}

function Dashboard({income,expense,balance,tx,categoryData,monthData}){
 return <div className="space-y-5">
  <div><h2 className="text-2xl font-bold">Dashboard</h2><p className="text-slate-500">Festival financial overview</p></div>
  <div className="grid sm:grid-cols-3 gap-4">
   <Card title="Total Income" value={money(income)} icon={<IndianRupee/>}/>
   <Card title="Total Expenses" value={money(expense)} icon={<ReceiptText/>}/>
   <Card title="Current Balance" value={money(balance)} icon={<Wallet/>} strong/>
  </div>
  <div className="grid lg:grid-cols-2 gap-5">
   <Panel title="Income vs Expense"><div className="h-72"><ResponsiveContainer><BarChart data={monthData}><XAxis dataKey="name"/><YAxis/><Tooltip formatter={v=>money(v)}/><Legend/><Bar dataKey="Income"/><Bar dataKey="Expense"/></BarChart></ResponsiveContainer></div></Panel>
   <Panel title="Expense by Category"><div className="h-72"><ResponsiveContainer><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>{categoryData.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip formatter={v=>money(v)}/><Legend/></PieChart></ResponsiveContainer></div></Panel>
  </div>
  <Panel title="Recent Transactions"><Table rows={tx.slice(-6).reverse()}/></Panel>
 </div>
}
function Card({title,value,icon,strong}){return <div className={`bg-white rounded-2xl border p-5 ${strong?"ring-2 ring-orange-200":""}`}><div className="flex justify-between"><span className="text-sm text-slate-500">{title}</span><span className="text-orange-600">{icon}</span></div><div className="text-2xl font-bold mt-3">{value}</div></div>}
function Panel({title,children}){return <section className="bg-white border rounded-2xl p-5"><h3 className="font-semibold mb-4">{title}</h3>{children}</section>}

function TransactionPage({type,rows,query,setQuery,add,edit,remove,exportRows}){
 const shown=type==="All"?rows:rows.filter(r=>r.type===type);
 return <div className="space-y-5"><div className="flex flex-wrap gap-3 items-center justify-between"><div><h2 className="text-2xl font-bold">{type==="All"?"Transaction Register":type+" Register"}</h2><p className="text-slate-500">{shown.length} transactions</p></div><div className="flex gap-2"><button onClick={exportRows} className="border bg-white px-4 py-2 rounded-xl flex gap-2"><Download size={17}/> Export CSV</button><button onClick={add} className="bg-orange-600 text-white px-4 py-2 rounded-xl flex gap-2"><Plus size={17}/> Add {type==="Expense"?"Expense":"Income"}</button></div></div>
 <Panel title=""><div className="flex items-center border rounded-xl px-3 mb-4"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search party, category, reference..." className="w-full p-3 outline-none"/></div><Table rows={shown} actions={{edit,remove}}/></Panel></div>
}
function Table({rows,actions}){return <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-slate-500">{["Date","Type","Category","Party/Donor","Mode","Amount","Reference","Remarks",actions?"Actions":""].map((h,i)=><th key={i} className="p-3 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="p-3">{r.date}</td><td className="p-3">{r.type}</td><td className="p-3">{r.category}</td><td className="p-3">{r.party}</td><td className="p-3">{r.mode}</td><td className="p-3 font-semibold">{money(r.amount)}</td><td className="p-3">{r.ref}</td><td className="p-3">{r.remarks}</td>{actions&&<td className="p-3 flex gap-2"><button onClick={()=>actions.edit(r)} className="p-2 border rounded-lg"><Pencil size={15}/></button><button onClick={()=>actions.remove(r.id)} className="p-2 border rounded-lg text-red-600"><Trash2 size={15}/></button></td>}</tr>)}</tbody></table></div>}
function BalanceSheet({opening,income,expense,balance,tx}){return <div className="space-y-5"><h2 className="text-2xl font-bold">Balance Sheet</h2><div className="grid md:grid-cols-2 gap-5"><Panel title="Receipts"><Row n="Opening Balance" v={opening}/><Row n="Total Income" v={income}/><hr className="my-3"/><Row n="Total Receipts" v={opening+income} bold/></Panel><Panel title="Payments"><Row n="Total Expenses" v={expense}/><hr className="my-3"/><Row n="Closing Balance" v={balance} bold/></Panel></div><Panel title="Income / Expense Summary"><Table rows={tx}/></Panel></div>}
function Row({n,v,bold}){return <div className={`flex justify-between py-2 ${bold?"font-bold text-lg":""}`}><span>{n}</span><span>{money(v)}</span></div>}
function Reports({tx,income,expense,balance,opening,exportRows}){return <div className="space-y-5"><div className="flex justify-between"><div><h2 className="text-2xl font-bold">Reports</h2><p className="text-slate-500">Festival final financial report</p></div><button onClick={exportRows} className="border bg-white px-4 py-2 rounded-xl flex gap-2"><Download size={17}/> Export</button></div><Panel title="Final Statement"><Row n="Opening Balance" v={opening}/><Row n="Total Income" v={income}/><Row n="Total Expenses" v={expense}/><hr className="my-3"/><Row n="Closing Balance" v={balance} bold/></Panel><Panel title="All Transactions"><Table rows={tx}/></Panel></div>}
function SettingsPage({mandal,setMandal,festivalYear,setFestivalYear,opening,setOpening}){return <div className="max-w-2xl space-y-5"><h2 className="text-2xl font-bold">Festival Settings</h2><Panel title="Mandal Details"><label className="block mb-4 text-sm">Mandal Name<input className="w-full border rounded-xl p-3 mt-1" value={mandal} onChange={e=>setMandal(e.target.value)}/></label><label className="block mb-4 text-sm">Festival Year<input className="w-full border rounded-xl p-3 mt-1" value={festivalYear} onChange={e=>setFestivalYear(e.target.value)}/></label><label className="block text-sm">Opening Balance<input type="number" className="w-full border rounded-xl p-3 mt-1" value={opening} onChange={e=>setOpening(Number(e.target.value))}/></label></Panel></div>}
function EntryModal({type,initial,onClose,onSave}){const [f,setF]=useState(initial||{date:new Date().toISOString().slice(0,10),type,category:type==="Income"?incomeCats[0]:expenseCats[0],party:"",mode:"Cash",amount:"",ref:"",remarks:""});const set=(k,v)=>setF({...f,[k]:v});return <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-2xl p-6"><div className="flex justify-between mb-5"><h3 className="text-xl font-bold">{initial?"Edit":"Add"} {type}</h3><button onClick={onClose}>✕</button></div><div className="grid md:grid-cols-2 gap-4"><label className="text-sm">Date<input type="date" className="w-full border rounded-xl p-3 mt-1" value={f.date} onChange={e=>set("date",e.target.value)}/></label><label className="text-sm">Category<select className="w-full border rounded-xl p-3 mt-1" value={f.category} onChange={e=>set("category",e.target.value)}>{(type==="Income"?incomeCats:expenseCats).map(x=><option key={x}>{x}</option>)}</select></label><label className="text-sm">Party / Donor<input className="w-full border rounded-xl p-3 mt-1" value={f.party} onChange={e=>set("party",e.target.value)}/></label><label className="text-sm">Payment Mode<select className="w-full border rounded-xl p-3 mt-1" value={f.mode} onChange={e=>set("mode",e.target.value)}>{modes.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-sm">Amount<input required type="number" min="0" className="w-full border rounded-xl p-3 mt-1" value={f.amount} onChange={e=>set("amount",e.target.value)}/></label><label className="text-sm">Reference Number<input className="w-full border rounded-xl p-3 mt-1" value={f.ref} onChange={e=>set("ref",e.target.value)}/></label><label className="text-sm md:col-span-2">Description / Remarks<textarea className="w-full border rounded-xl p-3 mt-1" value={f.remarks} onChange={e=>set("remarks",e.target.value)}/></label></div><div className="flex justify-end gap-2 mt-5"><button onClick={onClose} className="border px-4 py-2 rounded-xl">Cancel</button><button disabled={!f.amount} onClick={()=>onSave(f)} className="bg-orange-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl">Save</button></div></div></div>}
