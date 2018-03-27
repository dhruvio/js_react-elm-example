"use strict";

import React from "react";
import PropTypes from "prop-types";
import httpCommand from "../command/http";
import websocketSubscription from "../subscription/websocket";

export const init = (options = {}) => {
  const {
    id = "",
    imageUrl = "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    likes = 0,
    statusMessage = "loading",
    bucketId = ""
  } = options;
  return {
    state: {
      statusMessage,
      id,
      imageUrl,
      likes,
      bucketId
    }
  };
};

export const subscriptions = state => {
  if (state.id) return [ websocketSubscription(`like:${state.id}`, "onLikeSuccess") ];
  else return [];
};

export const update = (state, message, data) => {
  switch (message) {
    case "like":
      const command = httpCommand({
        method: "POST",
        url: `http://localhost:3001/like/${state.id}`,
        headers: { "x-bucket-id": state.bucketId },
        successMessage: "onLikeSuccess",
        failureMessage: "onLikeFailure"
      });
      return { state, command };

    case "onLikeSuccess":
      state.likes = data.body.likes;
      return { state };

    case "onLikeFailure":
      return { state };

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

const viewLikeButton = ({ state, dispatch }) => {
  if (state.statusMessage === "complete")
    return (
      <button onClick={() => dispatch("like")}>
        Like
      </button>
    );
};

export const view = ({ state, dispatch }) => {
  return (
    <div className="gif">
      <img src={state.imageUrl} style={{ width: "300px" }}/>
      {viewMetadata({ state })}
      {viewLikeButton({ state, dispatch })}
    </div>
  );
};
