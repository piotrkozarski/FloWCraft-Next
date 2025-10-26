export default function Section({title,action,children}:{title:string;action?:React.ReactNode;children:React.ReactNode}){
  return (
    <div className="md-card">
      <div className="md-section border-b border-md-outline flex items-center justify-between">
        <h2 className="text-slate-800 font-semibold">{title}</h2>
        {action}
      </div>
      <div className="md-section">{children}</div>
    </div>
  )
}