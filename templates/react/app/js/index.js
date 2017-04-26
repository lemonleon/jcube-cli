import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

console.log(`React: ${React}`);
console.log(`ReactDOM: ${ReactDOM}`);

require('../css/style.css');
require('../css/index.scss');

class App extends Component {
    render () {
        return (
            <div>
                <h2>HELLO JCUBE!</h2>
                <img src={require('../css/img/1.jpg')} />
                <div id="desc">
                    <a href="#" target="_blank" className="git">GIT</a>
                    <a href="https://www.npmjs.com/package/jcube" target="_blank" className="npm">NPM</a>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);

document.getElementById('btn').onclick = function (){
    System.import('./asnyc')
          .then(function (data){
              console.log(data, data.year, data.hour(Date.now()));
          })
};

{
    let querySql =  function (data){
        return new Promise((resolve, reject) => {
            setTimeout(function (){
                resolve(data);
            }, 2000);
        });
    }

    let async1 = async function () {
        var data1 = await querySql('a');
        console.log(data1);
        var data2 = await querySql('b');
        console.log(data2);
    };

    async1();
}