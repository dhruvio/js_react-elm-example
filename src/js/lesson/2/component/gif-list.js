"use strict";

import React from "react";
import PropTypes from "prop-types";
import { assign } from "lodash";
import * as Gif from "./gif";
import mapIndexedDispatch from "../util/map-indexed-dispatch";
import mapIndexedCommand from "../util/map-indexed-command";
import mapIndexedSubscriptions from "../util/map-indexed-subscriptions";
import updateIndexedChild from "../util/update-indexed-child";
import batchCommands from "../util/batch-commands";
import backEndGet from "../command/back-end-get";

const getGifsCommand = sessionId => backEndGet({
  path: "gif",
  headers: { "x-session-id": sessionId },
  successMessage: "onGetSuccess",
  failureMessage: "onGetFailure"
});

const INIT_SESSION_ID = "defaultSession";

export const init = () => ({
  state: {
    loadingStatus: "complete",
    sessionId: {
      input: INIT_SESSION_ID,
      value: INIT_SESSION_ID
    },
    category: {
      input: "cat",
      value: "cat"
    },
    gifs: []
  },
  command: getGifsCommand(INIT_SESSION_ID)
});

export const subscriptions = () => [];

export const update = (state, message, data) => {
  switch (message) {
    case "onInputSessionId":
      state.sessionId.input = data.input;
      return { state };

    case "changeSessionId":
      state.sessionId.value = state.sessionId.input;
      return {
        state,
        command: getGifsCommand(state.sessionId.value)
      };

    case "onInputCategory":
      state.category.input = data.input;
      return { state };

    case "changeCategory":
      state.category.value = state.category.input;
      return { state };

    case "addGif":
      const { state: childState, command: childCommand } = Gif.init({
        sessionId: state.sessionId.value,
        category: state.category.value
      });
      const command = mapIndexedCommand("updateGif", state.gifs.length, childCommand);
      state.gifs.push(childState);
      return { state, command };

    case "updateGif":
      return updateIndexedChild({
        key: "gifs",
        index: data.index,
        parentState: state,
        parentMessage: "updateGif",
        childUpdate: Gif.update,
        childMessage: data.message,
        childData: data.data
      });

    case "onGetSuccess":
      state.loadingStatus = "complete";
      const result = data.body.map(
        gif => Gif.init(
          assign(
            {
              sessionId: state.sessionId.value,
              category: state.category.value
            },
            gif
          )
        )
      );
      state.gifs = result.map(({ state }) => state);
      const commands = result.map(({ command }, index) => mapIndexedCommand("updateGif", index, command));
      return {
        state,
        command: batchCommands(...commands)
      };

    case "onGetFailure":
      state.loadingStatus = "error";
      return { state };

    default:
      return { state };
  }
};

const viewGifs = ({ gifs, dispatch }) => {
  const children= gifs.reduce(
    (views, gif, index) => {
      //reverse the UI of gifs so the newest one is at the top
      views.unshift(
        <div key={index} className="gif-list-child" style={{ marginTop: "40px" }}>
        <Gif.view state={gif} dispatch={mapIndexedDispatch("updateGif", index, dispatch)} />
        </div>
      );
      return views;
    },
    []
  );
  return (
    <div className="gif-list-children">
      {children}
    </div>
  );
};

export const view = ({ state, dispatch }) => {
  const onInputSessionId = e => dispatch("onInputSessionId", { input: e.target.value });
  const onInputCategory = e => dispatch("onInputCategory", { input: e.target.value });
  const changeSessionId = e => e.preventDefault() || dispatch("changeSessionId");
  const changeCategory = e => e.preventDefault() || dispatch("changeCategory");
  const addGif = () => dispatch("addGif");
  return (
    <div className="gif-list">
      <h1>Gif List</h1>
      <ul className="gif-list-metadata">
        <li>Session ID: {state.sessionId.value}</li>
        <li>Category: {state.category.value}</li>
      </ul>
      <form className="gif-list-session-id" onSubmit={changeSessionId}>
        <input value={state.sessionId.input} onChange={onInputSessionId} />
        <button onClick={changeSessionId}>Change Session ID</button>
      </form>
      <form className="gif-list-category" onSubmit={changeCategory}>
        <input value={state.category.input} onChange={onInputCategory} />
        <button onClick={changeCategory}>Change Category</button>
      </form>
      <div className="gif-list-add">
        <button onClick={addGif}>Add Gif</button>
      </div>
      {viewGifs({
        gifs: state.gifs,
        dispatch
      })}
    </div>
  );
};
