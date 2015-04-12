var RxReact = require('rx-react');
var FuncSubject = RxReact.FuncSubject;
var React = require('react');
var Rx    = require('rx-dom');
var StateStreamMixin = require('rx-react').StateStreamMixin;

console.log("rx-react",RxReact)


function searchWikipedia(term) {
    console.log("searchin for ",term)
    var cleanTerm = global.encodeURIComponent(term);
    var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='+ 
        cleanTerm + '&callback=JSONPCallback';
    return Rx.DOM.jsonpRequest(url);
}




class SearchWikipedia extends RxReact.Component {
  constructor(props) {
    super(props);
    this.keyup = FuncSubject.create();
  }
  
  getStateStream() {
    return (
      this.keyup
      .map((e) => e.target.value)
      .filter(text => text.length > 2)
      .throttle(250)
      .distinctUntilChanged()
      .flatMapLatest(text => searchWikipedia(text))
      .map(data => data.response)
      .filter(data => data.length >= 2)
      .map(results => ({results: results[1]}))
    );
  }
  
  render() {
    var results = this.state && this.state.results || [];
    return (
      <div>
        <div>Start Typing</div>
        <input type="text" id="searchtext" onKeyUp={this.keyup}/>
        <ul id="results">{
          results.map((result, index) => 
            <li key={index}>{result}</li>
          )
        }</ul>
      </div>
    );
  }
}


export default SearchWikipedia

/*var Timer = React.createClass({
  mixins: [StateStreamMixin],
  getStateStream: function() {
    return Rx.Observable.interval(1000).map(function (interval) {
      return {
        secondsElapsed: interval
      };
    });
  },
  render: function() {
    var secondsElapsed = this.state? this.state.secondsElapsed : 0;
    return (
      <div>Seconds Elapsed: {secondsElapsed}</div>
    );
  }
});

React.render(<Timer />, document.getElementById('timer-holder'));*/

//React.render(<SearchWikipedia />, document.getElementById('container'));