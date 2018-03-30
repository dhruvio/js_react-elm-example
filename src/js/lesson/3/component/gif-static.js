"use strict";

import { defaults } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import * as GifConnected from "./gif-connected";
import dispatchCommand from "../command/dispatch";
import httpCommand from "../command/http";
import websocketSubscription from "../subscription/websocket";
import batchCommands from "../util/batch-commands";

export const init = (options = {}) => {
  const {
    id = "",
    imageUrl = "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    likes = 0,
    statusMessage = "loading",
    bucketId = "",
    showPermalinkButton = false
  } = options;
  return {
    state: {
      statusMessage,
      id,
      imageUrl,
      likes,
      bucketId,
      showPermalinkButton,
      ignoreNextWebsocketMessage: false
    }
  };
};

export const subscriptions = state => {
  if (state.id) return [ websocketSubscription(`like:${state.id}`, "receiveLike") ];
  else return [];
};

export const update = (state, message, data) => {
  switch (message) {
    case "like":
      state.ignoreNextWebsocketMessage = true;
      return {
        state,
        command: httpCommand({
          method: "POST",
          url: `http://localhost:3001/like/${state.id}`,
          headers: { "x-bucket-id": state.bucketId },
          successMessage: "onLikeSuccess",
          failureMessage: "onLikeFailure"
        })
      };

    case "onLikeSuccess":
      state.likes = data.body.likes;
      return { state };

    case "onLikeFailure":
      return { state };

    case "receiveLike":
      let command;
      if (!state.ignoreNextWebsocketMessage)
        command = batchCommands(
          dispatchCommand("@incrementWebsocketCount"),
          dispatchCommand("onLikeSuccess", data)
        );
      else
        state.ignoreNextWebsocketMessage = false;
      return { state, command };

    default:
      return { state };
  }
};

const viewMetadata = ({ state }) => {
  if (state.statusMessage === "complete")
    return (
      <ul className="gif-metadata">
        <li>Status: {state.statusMessage}</li>
        <li>ID: {state.id}</li>
        <li>Likes: {state.likes}</li>
      </ul>
    );
  else
    return (
      <ul className="gif-metadata">
        <li>Status: {state.statusMessage}</li>
      </ul>
    );
};

const viewButtons = ({ state, dispatch }) => {
  if (state.statusMessage === "complete") {
    const like = () => dispatch("like");
    const navigate = () => dispatch("@navigate", {
      Component: GifConnected,
      initArgs: [{
        id: state.id,
        bucketId: state.bucketId
      }]
    });
    return (
      <div className="gif-buttons">
        <button onClick={like}>Like</button>
        {state.showPermalinkButton ? (<button onClick={navigate}>Permalink</button>) : undefined}
      </div>
    );
  }
};

export const view = ({ state, dispatch }) => {
  return (
    <div className="gif">
      <img src={state.imageUrl} style={{ width: "300px" }}/>
      {viewMetadata({ state })}
      {viewButtons({ state, dispatch })}
    </div>
  );
};
