
import { html } from 'snabbdom-jsx'
import Class from 'classnames'


export default function checkbox({id, value, checked, className}){


  return <div className='checkbox'>
  	<input type='checkbox' value={value} checked={checked} id={id} className={className}/>
  	<label htmlFor={id}></label>
  </div>
}
