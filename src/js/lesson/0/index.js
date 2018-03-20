"use strict";

import { noop } from "lodash";
import React from "react";
import ReactDom from "react-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { init, update, View } from "./component/counter-duo";

//TODO top-level state should be { state, pendingCommands = [] }
//TODO pass state prop to update and render

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
  (<View state={state} dispatch={dispatch} />),
  document.getElementById("main")
);

//initialize the store
const reducer = updateToReducer(update);
//support redux devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  init(), 
  composeEnhancers(applyMiddleware(commandMiddleware))
);
const dispatch = storeToDispatch(store);
const tick = () => render(store.getState().state, dispatch);

//re-render whenever state changes
store.subscribe(tick);

//initial render
tick();
