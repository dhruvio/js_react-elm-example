"use strict";

import React from "react";
import PropTypes from "prop-types";
import backEndGet from "../command/back-end-get";
import backEndPost from "../command/back-end-post";

const getGifCommand = (sessionId, category) => backEndGet({
  path: `gif/${category}`,
  headers: { "x-session-id": sessionId },
  successMessage: "onGetSuccess",
  failureMessage: "onGetFailure"
});

export const init = ({
  sessionId,
  id = "",
  imageUrl = "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  likes = 0,
  category = "cat"
}) => ({
  state: {
    alreadyLiked: false,
    loadingStatus: id ? "complete" : "loading",
    sessionId,
    id,
    imageUrl,
    likes
  },
  command: id ? undefined : getGifCommand(sessionId, category)
});

export const subscriptions = () => [];

export const update = (state, message, data) => {
  switch (message) {
    case "onGetSuccess":
      state.loadingStatus = "complete";
      state.id = data.body.id;
      state.imageUrl = data.body.imageUrl;
      state.likes = data.body.likes;
      return { state };

    case "onGetFailure":
      state.loadingStatus = "error";
      state.imageUrl = "https://media.giphy.com/media/l4KibWpBGWchSqCRy/giphy.gif";
      return { state };

    case "like":
      let command;
      if (!state.alreadyLiked) {
        state.alreadyLiked = true;
        command = backEndPost({
          path: `like/${state.id}`,
          headers: { "x-session-id": state.sessionId },
          successMessage: "onLikeSuccess",
          failureMessage: "onLikeFailure"
        });
      }
      return {
        state,
        command
      };

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
  if (state.loadingStatus === "complete")
    return (
      <ul className="gif-metadata">
        <li>Status: {state.loadingStatus}</li>
        <li>ID: {state.id}</li>
        <li>Likes: {state.likes}</li>
      </ul>
    );
  else
    return (
      <ul className="gif-metadata">
        <li>Status: {state.loadingStatus}</li>
      </ul>
    );
};

const viewLikeButton = ({ state, dispatch }) => {
  if (state.loadingStatus === "complete")
    return (
      <button onClick={() => dispatch("like")} disabled={state.alreadyLiked}>
        {state.alreadyLiked ? "Liked" : "Like"}
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
