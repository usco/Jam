import {createAction} from '../utils/obsUtils'


/*create new note */
export let addNote$ = createAction()

/*create new thickness annot*/
export let addThicknessAnnot$ = createAction()

/*create new distance annot*/
export let addDistanceAnnot$ = createAction()

/*create new diameter annot*/
export let addDiameterAnnot$ = createAction()

/*create new angle annot*/
export let addAngleAnnot$ = createAction()

//
/*toggle note */
export let toggleNote$ = createAction()

/*toggle thickness annot*/
export let toggleThicknessAnnot$ = createAction()

/*toggle distance annot*/
export let toggleDistanceAnnot$ = createAction()

/*toggle diameter annot*/
export let toggleDiameterAnnot$ = createAction()

/*toggle angle annot*/
export let toggleAngleAnnot$ = createAction()
