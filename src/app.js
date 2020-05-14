import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppRouter from './routers/AppRouter';
import configureStore from './store/configureStore';
import { switchBoolean, increment, decrement } from './actions';
import { ContainerElement, GlobalStyleElement } from './styles';

const store = configureStore();
console.log(store.getState());
store.subscribe(() => console.log(store.getState()));
store.dispatch(switchBoolean);
store.dispatch(increment);
store.dispatch(decrement);

const App = (
  <ContainerElement>
    <GlobalStyleElement />
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </ContainerElement>
);

ReactDOM.render(App, document.getElementById('app'));
