const _ = require("lodash");
const got = require("got");

const activeSockets = [];

const activeSocketIndex = socket => activeSockets.indexOf(socket);

const activateSocket = socket => {
  if (activeSocketIndex(socket) === -1) activeSockets.push(socket);
};

const deactivateSocket = socket => {
  const index = activeSocketIndex(socket);
  if (index !== -1) activeSockets.splice(index, 1);
};

const publish = (event, data) => {
  activeSockets.forEach(socket => socket.emit(event, data));
};

const router = (method, url = "") => {
  method = method.toLowerCase();
  let match;
  if (method === "options")
    return {
      route: "options",
      params: {}
    };
  else if ((method === "get") && (match = url.match(/^\/gif\/?$/)))
    return {
      route: "getAllGifs",
      params: {}
    };
  else if ((method === "get") && (match = url.match(/^\/gif\/([a-zA-Z0-9]+)\/?$/)))
    return {
      route: "getOneGif",
      params: {
        id: match[1]
      }
    };
  else if ((method === "post") && (match = url.match(/^\/gif\/([a-zA-Z]+)\/?$/)))
    return {
      route: "fetchNewGif",
      params: {
        category: match[1]
      }
    };
  else if ((method === "post") && (match = url.match(/^\/like\/([a-zA-Z0-9]+)\/?$/)))
    return {
      route: "likeGif",
      params: {
        id: match[1]
      }
    };
  else
    return {};
};

const gifStores = {};

const storeGetAll = bucketId => gifStores[bucketId] || [];

const storeGetOne = (bucketId, id) => {
  const gifs = storeGetAll(bucketId);
  return _.find(gifs, { id });
};

const storePut = (bucketId, id, imageUrl) => {
  const data = { id, imageUrl, likes: 0 };
  gifStores[bucketId] = storeGetAll(bucketId).concat(data);
  return data;
};

const storeLike = (bucketId, id) => {
  const data = _.find(storeGetAll(bucketId), { id });
  if (!data) throw new Error(`Can't like gif that doesn't exist in bucket ${bucketId} for id ${id}`);
  data.likes++;
  return data;
};

const handlers = {

  options: async () => {
    return {
      code: 200
    };
  },

  getAllGifs: async bucketId => {
    return {
      code: 200,
      body: storeGetAll(bucketId)
    };
  },

  getOneGif: async (bucketId, { id }) => {
    const body = storeGetOne(bucketId, id);
    if (body) return { code: 200, body };
    return { code: 404 };
  },

  fetchNewGif: async (bucketId, { category = "cat" }) => {
    try {
      const url = `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${category}`;
      let { body } = await got(url);
      body = JSON.parse(body);
      const id = _.get(body, "data.id");
      const imageUrl = _.get(body, "data.image_url");
      return {
        code: 200,
        body: storePut(bucketId, id, imageUrl)
      };
    } catch (error) {
      return {
        code: 400,
        body: {
          message: error.message
        }
      };
    }
  },

  likeGif: async (bucketId, { id }) => {
    const body = storeLike(bucketId, id);
    publish(`like:${body.id}`, { likes: body.likes });
    return {
      code: 200,
      body
    };
  }

};

module.exports = grunt => {
  const log = msg => grunt.log.writeln(`[connect:backEnd] ${msg}`);
  return {
    backEnd: {
      options: {
        port: gruntConfig.env.backEndPort,
        hostname: gruntConfig.env.backEndHost,
        onCreateServer: (server, connect, options) => {
          const io = require("socket.io").listen(server);
          io.on("connection", socket => {
            activateSocket(socket);
            socket.on("disconnect", () => deactivateSocket(socket));
          });
        },
        middleware: [
          (req, res, next) => {
            log(`request: ${req.method} ${req.url}`);
            const { route, params } = router(req.method, req.url);
            if (!route) return next();
            const bucketId = req.headers["x-bucket-id"] || "cats";
            const handler = handlers[route];
            if (!handler) return next();
            log(`handler: ${route} ${bucketId}`);
            handler(bucketId, params)
              .then(({ code, body }) => {
                res.statusCode = code;
                res.setHeader("access-control-allow-headers", "x-bucket-id, content-type");
                res.setHeader("access-control-allow-methods", "OPTIONS, GET, POST");
                res.setHeader("access-control-allow-origin", "*");
                res.setHeader("accept", "application/json");
                res.setHeader("content-type", "application/json");
                if (body) res.write(JSON.stringify(body), "utf8");
                res.end();
              })
              .catch(error => {
                log("unhandled error");
                log(error.message || error);
              });
          }
        ]
      }
    }
  };
};
