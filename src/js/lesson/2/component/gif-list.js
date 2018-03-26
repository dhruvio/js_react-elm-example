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

const getAllGifs = bucketId => backEndGet({
  path: "gif",
  headers: { "x-bucket-id": bucketId },
  successMessage: "onGetAllGifsSuccess",
  failureMessage: "onGetAllGifsFailure"
});

const getNewGif = (bucketId, category) => backEndGet({
  path: `gif/${category}`,
  headers: { "x-bucket-id": bucketId },
  successMessage: "onGetNewGifSuccess",
  failureMessage: "onGetNewGifFailure"
});


const INIT_BUCKET_ID = "dogs";

export const init = () => ({
  state: {
    loadingStatus: "complete",
    bucketId: {
      input: INIT_BUCKET_ID,
      value: INIT_BUCKET_ID
    },
    categoryInput: "dog",
    gifs: []
  },
  command: getAllGifs(INIT_BUCKET_ID)
});

export const subscriptions = () => [];

export const update = (state, message, data) => {
  switch (message) {
    case "onInputBucketId":
      state.bucketId.input = data.input;
      return { state };

    case "changeBucketId":
      state.loadingStatus = "loading";
      state.bucketId.value = state.bucketId.input;
      return {
        state,
        command: getAllGifs(state.bucketId.value)
      };

    case "onInputCategory":
      state.categoryInput = data.input;
      return { state };

    case "addGif":
      state.loadingStatus = "loading";
      return {
        state,
        command: getNewGif(state.bucketId.value, state.categoryInput)
      };

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

    case "onGetAllGifsSuccess":
      state.loadingStatus = "complete";
      const result = data.body.map(
        gif => Gif.init({
          id: gif.id,
          imageUrl: gif.imageUrl,
          likes: gif.likes,
          loadingStatus: "complete",
          bucketId: state.bucketId.value
        })
      );
      state.gifs = result.map(({ state }) => state);
      return { state };

    case "onGetAllGifsFailure":
      state.loadingStatus = "error";
      return { state };

    case "onGetNewGifSuccess":
      state.loadingStatus = "complete";
      const { state: gifState } = Gif.init({
        id: data.body.id,
        imageUrl: data.body.imageUrl,
        likes: data.body.likes,
        loadingStatus: "complete",
        bucketId: state.bucketId.value
      });
      state.gifs.push(gifState);
      return { state };

    case "onGetNewGifFailure":
      console.error(data.body);
      state.loadingStatus = "complete";
      const { state: errorGifState }= Gif.init({
        imageUrl: "https://media.giphy.com/media/l4KibWpBGWchSqCRy/giphy.gif",
        loadingStatus: "error"
      });
      state.gifs.push(errorGifState);
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
  const onInputBucketId = e => dispatch("onInputBucketId", { input: e.target.value });
  const onInputCategory = e => dispatch("onInputCategory", { input: e.target.value });
  const changeBucketId = e => e.preventDefault() || dispatch("changeBucketId");
  const addGif = e => e.preventDefault() || dispatch("addGif");
  return (
    <div className="gif-list">
      <h1>Gif List</h1>
      <ul className="gif-list-metadata">
        <li>Loading status: {state.loadingStatus}</li>
        <li>Bucket ID: {state.bucketId.value}</li>
        <li>Category: {state.categoryInput}</li>
      </ul>
      <form className="gif-list-bucket-id" onSubmit={changeBucketId}>
        <input value={state.bucketId.input} onChange={onInputBucketId} />
        <button onClick={changeBucketId}>Change Bucket ID</button>
      </form>
      <form className="gif-list-add" onSubmit={addGif}>
        <input value={state.categoryInput} onChange={onInputCategory} />
        <button onClick={addGif}>Add Gif</button>
      </form>
      {viewGifs({
        gifs: state.gifs,
        dispatch
      })}
    </div>
  );
};
