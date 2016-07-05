import { html } from 'snabbdom-jsx'

export default function checkbox ({id, value, checked, name, className, disabled}) {
  return <div className='checkbox' disabled={disabled}>
    <input type='checkbox' value={value} checked={checked} id={id} name={name} className={className} disabled={disabled}/>
    <label htmlFor={id}></label>
  </div>
}
