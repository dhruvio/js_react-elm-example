"use strict";

import { noop, isEqual, differenceWith, get } from "lodash";
import React from "react";
import ReactDom from "react-dom";
import { createStore, applyMiddleware, compose } from "redux";
import * as Root from "./component/counter-list";

//helper to build dispatch function
const storeToDispatch = store => (type, data) => store.dispatch({ type, data });

//middleware to execute commands
const commandMiddleware = store => next => action => {
  const result = next(action);
  const { state, command = noop } = store.getState();
  const dispatch = storeToDispatch(store);
  command(dispatch);
  return result;
};

//helper to build reducer function
const updateToReducer = update => ({ state }, { type: message, data }) => update(state, message, data);

//helper to propagate render to DOM
const render = (state, dispatch) => ReactDom.render(
  (<Root.view state={state} dispatch={dispatch} />),
  document.getElementById("main")
);

//helper to manage subscription state
let activeSubscriptions = [];
const manageSubscriptions = (state, dispatch) => {
  const componentSubs = Root.subscriptions(state);
  const comparator = (a, b) => isEqual(get(a, "id"), get(b, "id"));
  const subsToBeStopped = differenceWith(activeSubscriptions, componentSubs, comparator);
  const unaffectedSubs = differenceWith(activeSubscriptions, subsToBeStopped, comparator);
  const subsToBeStarted = differenceWith(componentSubs, unaffectedSubs, comparator);
  subsToBeStopped.forEach(({ stop }) => stop());
  activeSubscriptions = unaffectedSubs.concat(
    subsToBeStarted.map(
      ({ id, start }) => ({ id, stop: start(dispatch) })
    )
  );
};

//set up the reducer function
const reducer = updateToReducer(Root.update);
//support redux devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//initialize the store
const store = createStore(
  reducer,
  Root.init(), 
  composeEnhancers(applyMiddleware(commandMiddleware))
);
//build root component dispatch function
const dispatch = storeToDispatch(store);

//render the component tree, and
//manage subscriptions
//every state update
const tick = () => {
  const state = store.getState().state;
  render(state, dispatch);
  manageSubscriptions(state, dispatch);
};

//re-render whenever state changes
store.subscribe(tick);

//kick off the state machine
tick();
