var stateTree = require('../core/_stateTree.js');
var React = require('react');

import {addItemToFeed} from '../actions/entityActions'


var FooComponent = React.createClass({
  mixins: [stateTree.mixin],
  cursors: {
    notifications: ['admin', 'notifications', 'list'],
    feeds: ['home', 'feeds']
  },
  handleKeyDown:function(event){
    if (event.keyCode == 13) {
      this.addNewToFeed();
    }
  },
  addNewToFeed:function(){
      let value = this.refs.newFeedTitle.getDOMNode().value;//event.detail.value;
      console.log("VALUE",value)
      addItemToFeed(value);
      this.refs.newFeedTitle.getDOMNode().value = "";
  },
  renderFeed: function (feed) {
    console.log("feed",feed)
    return (
      <li>{feed.title}</li>
    );
  },
  render: function () {
    return (
      <div>
        <input type="text" onKeyDown={this.handleKeyDown} ref="newFeedTitle"> </input>
        <button onClick={this.addNewToFeed}>Click to add to Feed </button>
        <div>You have {this.state.cursors.notifications.length} notifiations</div>
        <ul>
          {this.state.cursors.feeds.map(this.renderFeed)}
        </ul>
      </div>
    );
  }
});

export default FooComponent