"use strict";

import React from "react";
import ReactDom from "react-dom";
import { createStore } from "redux";
import { init, update, View } from "./component/root";

//helper to build reducer function
const updateToReducer = update => (state, { type: message, data }) => update(state, message, data);
//helper to build dispatch function
const storeToDispatch = store => (type, data) => store.dispatch({ type, data });
//helper to propagate render to DOM
const render = (state, dispatch) => ReactDom.render(
  (<View state={state} dispatch={dispatch} />),
  document.getElementById("main")
);
//initialize the store
const reducer = updateToReducer(update);
const store = createStore(reducer, init());
const dispatch = storeToDispatch(store);
const tick = () => render(store.getState(), dispatch);
//re-render whenever state changes
store.subscribe(tick);
//initial render
tick();
