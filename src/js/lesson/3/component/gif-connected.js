"use strict";

import { defaults } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import * as GifStatic from "./gif-static";
import httpCommand from "../command/http";
import mapDispatch from "../util/map-dispatch";
import mapSubscriptions from "../util/map-subscriptions";
import updateChild from "../util/update-child";

export const init = ({ id, bucketId }) => {
  return {
    state: GifStatic.init({ bucketId }).state,
    command: httpCommand({
      method: "GET",
      url: `http://localhost:3001/gif/${id}`,
      headers: { "x-bucket-id": bucketId },
      successMessage: "onGetSuccess",
      failureMessage: "onGetFailure"
    })
  };
};

export const subscriptions = state => {
  return mapSubscriptions("gifMessage", GifStatic.subscriptions(state));
};

export const update = (state, message, data) => {
  switch (message) {
    case "onGetSuccess":
      return {
        state: GifStatic.init({
          id: data.body.id,
          imageUrl: data.body.imageUrl,
          likes: data.body.likes,
          statusMessage: "complete",
          bucketId: state.bucketId
        }).state
      };

    case "onGetFailure":
      return {
        state: GifStatic.init({
          statusMessage: "error",
          imageUrl: "https://media.giphy.com/media/l4KibWpBGWchSqCRy/giphy.gif"
        }).state
      };

    case "gifMessage":
      return updateChild({
        parentState: state,
        parentMessage: "gifMessage",
        childUpdate: GifStatic.update,
        childMessage: data.message,
        childData: data.data
      });

    default:
      return { state };
  }
};

export const view = ({ state, dispatch }) => (
  <GifStatic.view state={state} dispatch={mapDispatch("gifMessage", dispatch)} />
);
