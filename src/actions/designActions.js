import {createAction} from '../utils/obsUtils'


/*create new design */
export let newDesign$ = createAction()

/*set active designs data/fields */
export let updateDesign$ = createAction()

/*save current design */
export let saveDesign$ = createAction()

/*load a design */
export let loadDesign$ = createAction()