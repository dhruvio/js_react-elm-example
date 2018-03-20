"use strict";

export default (parentMessage, dispatch) => (childMessage, childData) => dispatch(parentMessage, {
  message: childMessage,
  data: childData
});

