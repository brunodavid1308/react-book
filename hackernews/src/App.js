import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    const helloWorld = 'Hola! Bienvenidos al camino para aprender React';
    const user = {
      nombre: 'Bruno',
      apellido: 'ortega'
    };
    return (
      <div className="App">
        <h1>{user.nombre} {user.apellido}</h1>
        <h2>{helloWorld}</h2>
      </div>
    );
  }
}

export default App;
