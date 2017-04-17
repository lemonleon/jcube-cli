const moment = require('moment');

let year = moment(Date.now()).format('YYYY-MM-DD'),
    hour = function (now){
        return moment(now).format('HH:mm:ss');
    };

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

require('../css/asnyc.scss');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: hour(Date.now())
        };
    }

    componentDidMount () {
        setInterval(function (){
            this.setState({
                time: hour(Date.now())
            });
        }.bind(this), 1000);
    }
    
    render () {
        return (
            <div className="asnyc">
                <h1>{year}</h1>
                <h2>{this.state.time}</h2>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('asnyc')
);

export {year, hour};