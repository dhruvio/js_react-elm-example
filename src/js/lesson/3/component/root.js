"use strict";

import React from "react";
import PropTypes from "prop-types";
import * as GifList from "./gif-list";
import mapDispatch from "../util/map-dispatch";
import mapSubscriptions from "../util/map-subscriptions";
import mapCommand from "../util/map-command";
import updateChild from "../util/update-child";

export const init = (Component = GifList) => {
  const { state: pageState, command: pageCommand } = Component.init();
  return {
    state: {
      shared: {
        title: "",
        websocketCount: 0
      },
      page: {
        Component,
        state: pageState
      }
    },
    command: mapCommand("pageMessage", pageCommand)
  };
};

export const subscriptions = state => {
  const { Component, state: pageState } = state.page;
  return mapSubscriptions("pageMessage", Component.subscriptions(pageState));
};

export const update = (state, message, data) => {
  switch (message) {
    case "@setTitle":
      state.shared.title = data.title;
      return { state };

    case "@navigate":
      const { Component, initArgs = [] } = data;
      const { state: pageState, command: pageCommand } = Component.init(...initArgs);
      state.shared.websocketCount = 0;
      state.page = {
        Component,
        state: pageState
      };
      return {
        state,
        command: mapCommand("pageMessage", pageCommand)
      };

    case "@incrementWebsocketCount":
      state.shared.websocketCount++;
      return { state };

    case "pageMessage":
      return updateChild({
        key: "page.state",
        parentState: state,
        parentMessage: "pageMessage",
        childUpdate: state.page.Component.update,
        childMessage: data.message,
        childData: data.data
      });

    default:
      return { state };
  }
};

const viewHeader = ({ state, dispatch }) => {
  const h1Style = {
    color: "blue",
    textDecoration: "underline",
    cursor: "pointer"
  };
  return (
    <header>
      <h1 style={h1Style} onClick={() => dispatch("@navigate", { Component: GifList })}>
        My Gif App
      </h1>
      <ul>
        <li>
          <b>Title:</b> {state.shared.title}
        </li>
        <li>
          <b>Websocket messages received:</b> {state.shared.websocketCount}
        </li>
      </ul>
    </header>
  );
};

const viewActivePage = ({ state, dispatch }) => {
  const pageDispatch = mapDispatch("pageMessage", dispatch);
  const { Component, state: pageState } = state.page;
  return (
    <div className="page page-active">
      <Component.view shared={state.shared} state={pageState} dispatch={pageDispatch} />
    </div>
  );
};

export const view = ({ state, dispatch }) => {
  return (
    <div id="app">
      {viewHeader({ state, dispatch })}
      <hr />
      {viewActivePage({ state, dispatch })}
    </div>
  );
};
