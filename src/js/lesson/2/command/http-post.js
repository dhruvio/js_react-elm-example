"use strict";

import { assign } from "lodash";
import got from "got";

export default ({ path, headers, body = {}, successMessage, failureMessage, data = {} }) => dispatch => {
  got(`http://localhost:3001/${path}`, {
    json: true,
    method: "POST",
    headers,
    body
  }).then(({ body }) => dispatch(successMessage, assign({ body }, data)))
    .catch(error => dispatch(failureMessage, assign({ body: error }, data)));
};
