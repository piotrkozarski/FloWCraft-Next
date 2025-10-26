export default function Card({children,className=''}:{children:React.ReactNode; className?:string}){
  return <div className={`md-card ${className}`}>{children}</div>
}