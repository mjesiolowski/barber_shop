import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { HomePage, NotFoundPage, Header } from '../components';

const AppRouter = () => (
  <BrowserRouter>
    <Header />
    <Switch>
      <Route path="/" component={HomePage} exact={true} />
      <Route component={NotFoundPage} />
    </Switch>
  </BrowserRouter>
);

export default AppRouter;
