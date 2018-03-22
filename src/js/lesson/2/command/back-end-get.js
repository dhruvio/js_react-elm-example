"use strict";

import { assign } from "lodash";
import got from "got";

export default ({ path, headers, successMessage, failureMessage, data = {} }) => dispatch => {
  got(`http://localhost:3001/${path}`, { headers, json: true })
    .then(({ body }) => dispatch(successMessage, assign({ body }, data)))
    .catch(error => dispatch(failureMessage, assign({ body: error }, data)));
};
