export default function Progress({value}:{value:number}){
  const v=Math.max(0,Math.min(100,value))
  return <div className="progress"><i style={{width:`${v}%`}}/></div>
}