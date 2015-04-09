import {history} from './history'
var a = require("atomo");
import kurtsore from "kurtsore";
import {is} from "immutable";
import {state} from './state'
import {Albums} from './testView'



init(){
     let ori  = {
      "bla":42,
      "foo":"bar",
      "baz":[1,5,9]

    }
    var anAtom = a.atom(ori);
    console.log( anAtom.deref(), state.deref);

    let cursor = kurtsore.cursor(state),
    albums = cursor.derive('albums'),
    playlists = cursor.derive('playlists');

    console.log(state.deref().toJS())

    /*
        albums = cursor.derive('albums'),
        playlists = cursor.derive('playlists');

    let foo = is(
        albums.deref(),
        state.deref().get('albums')
    );
    //=> true

    let bar = is(
        playlists.deref(),
        state.deref().get('playlists')
    );*/

    console.log(  albums.deref().toJS(), playlists.deref().toJS() )
}

render(){




    let cursor = kurtsore.cursor(state),
    albums = cursor.derive('albums'),
    playlists = cursor.derive('playlists');
    let fooStyle =   {
      position: 'absolute',
      right: '0px',
      bottom: '0px',
    };

    //state.addWatch(() => render(kurtsore.cursor(state)));
    let self = this;
    state.addWatch(() => self.render(kurtsore.cursor(state)));

    return  <div style={fooStyle}>
            <Albums albums={albums}/>
          </div>


}