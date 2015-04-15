/*
class EntityInfos extends React.Component {
  constructor(props) {
    super(props);
    this.state={value:"dude"}
  }

  handleChange(event) {
    console.log(event,    this.state)
    this.setState({value: event.target.value});
  }

  render() {
    console.log("here")
    return <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />;
  }
}


class EntityInfos__ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
  }
  tick() {
    this.setState({count: this.state.count + 1});
  }
  render() {
    return (
      <div onClick={this.tick.bind(this)}>
        Clicks: {this.state.count}
      </div>
    );
  }
}


*/

/*var EntityInfos = React.createClass({

  getInitialState: function() {
    return {value: 'Hello!'};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    var value = this.state.value;
    return <input type="text" value={value} onChange={this.handleChange} />;
  }

});

export default EntityInfos
*/
