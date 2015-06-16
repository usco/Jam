import {createAction} from '../utils/obsUtils'

/*show context menu*/
export let showContextMenu$ = createAction();

/*hide context menu
*/
export let hideContextMenu$ = createAction();

/*ermm... undo ?*/
export let undo$ = createAction()

/*ermm... redo ?*/
export let redo$ = createAction()


/*not sure if this belongs here or in design actions*/
export let setDesignAsPersistent$ = createAction()

/*set current active tool*/
export let setActiveTool$ = createAction()

/*clear any active tool*/
export let clearActiveTool$ = createAction()

/*set a setting*/
export let setSetting$ = createAction()
