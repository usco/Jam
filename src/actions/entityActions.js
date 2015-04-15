    //-------COMMANDS OR SOMETHING LIKE THEM -----
  //FIXME; this should be a command or something
  /*set currently selected entities*/
  /*
  selectEntities(selectedEntities){
    let selectedEntities = selectedEntities || [];
    if(selectedEntities.constructor !== Array) selectedEntities = [selectedEntities]
    this.setState({
      selectedEntities:selectedEntities
    });
    log.info("selectedEntities",selectedEntities)
  }*/

  //FIXME; this should be a command or something
  /*set transforms of given entity
  setEntityTransforms(entity, transforms){
    log.info("setting transforms of",entity, "to", transforms)

    let _entitiesById = this.state._entitiesById;

    for(key in transforms){
      _entitiesById[entity.iuid][key] = transforms[key];
    }

    // _entitiesById[entity.iuid].rot = transforms.rot;
    //  _entitiesById[entity.iuid].sca = transforms.sca;
    

    this.setState({_entitiesById:_entitiesById})
  }*/

  //FIXME; this should be a command or something
  /*register a new entity type
  addEntityType( type ){
    log.info("adding entity type", type)
    let nKlasses  = this.state._entityKlasses;
    nKlasses.push( type )
    //this.setState({_entityKlasses:this.state._entityKlasses.push(type)})
    this.setState({_entityKlasses:nKlasses})
  }*/

  //FIXME; this should be a command or something


//import {newTodoCursor, todosCursor} from '../core/testState'

import stateTree from '../core/_stateTree'

/*
export function showOnlyProductsInStock(){
  stateTree.set('onlyProductsInStock', true);
}

export function showAllProducts () {
  stateTree.set('onlyProductsInStock', false);
}

export function searchProducts(query) {
  stateTree.set('query', query);
  ajax.get('/products', query)
    .done(function (products) {
      stateTree.set('products', products);
    });
}

export function setUserAge(age){
  return stateTree.select('user').set({age:age})
}
*/

export function addItemToFeed(title) {
  let title = title || "yeah"+Math.random();
  let item = {title:title};
  return stateTree.select('home','feeds').push(item);
}





/*save a new entity instance*/
/*addEntityInstance( instance ){
  log.info("adding entity instance", instance)
  let nEntities  = this.state._entities;
  nEntities.push( instance )
  this.setState({_entities:nEntities})

  let _entitiesById = this.state._entitiesById;
  _entitiesById[instance.iuid] = instance;
  this.setState({_entitiesById:_entitiesById})
}*/