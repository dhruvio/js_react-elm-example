"use strict";

import React from "react";
import ReactDom from "react-dom";
import { createStore } from "redux";
import * as Root from "./component/counter-list";

//helper to build reducer function
const updateToReducer = update => (state, { type: message, data }) => update(state, message, data);
//helper to build dispatch function
const storeToDispatch = store => (type, data) => store.dispatch({ type, data });
//helper to propagate render to DOM
const render = (state, dispatch) => ReactDom.render(
  (<Root.view state={state} dispatch={dispatch} />),
  document.getElementById("main")
);
//initialize the store
const reducer = updateToReducer(Root.update);
const store = createStore(
  reducer,
  Root.init(),
  //support redux devtools
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
const dispatch = storeToDispatch(store);
const tick = () => render(store.getState(), dispatch);
//re-render whenever state changes
store.subscribe(tick);
//initial render
tick();
