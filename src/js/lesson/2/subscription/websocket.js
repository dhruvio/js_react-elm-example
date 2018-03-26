"use strict";

import io from "socket.io-client";
import { assign } from "lodash";
import serializeSubscriptionId from "../util/serialize-subscription-id";

//TODO

const listeners = {};

export default (channel, message, data = {}) => {
  const id = serializeSubscriptionId("websocket", message, data);
  const start = dispatch => {
    return () => {};
  };
  return { id, start };
};
