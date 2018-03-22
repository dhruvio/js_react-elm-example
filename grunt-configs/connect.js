const _ = require("lodash");
const got = require("got");

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
  else if ((method === "get") && (match = url.match(/^\/gif\/([a-zA-Z]+)\/?$/)))
    return {
      route: "fetchGif",
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

const storeGetAll = sessionId => gifStores[sessionId] || [];

const storePut = (sessionId, id, imageUrl) => {
  const data = { id, imageUrl, likes: 0 };
  gifStores[sessionId] = storeGetAll(sessionId).concat(data);
  return data;
};

const storeLike = (sessionId, id) => {
  const data = _.find(storeGetAll(sessionId), { id });
  if (!data) throw new Error(`Can't like gif that doesn't exist in session ${sessionId} for id ${id}`);
  data.likes++;
  return data;
};

const handlers = {

  options: async () => {
    return {
      code: 200
    };
  },

  getAllGifs: async sessionId => {
    return {
      code: 200,
      body: storeGetAll(sessionId)
    };
  },

  fetchGif: async (sessionId, { category = "cat" }) => {
    try {
      const url = `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${category}`;
      let { body } = await got(url);
      body = JSON.parse(body);
      const id = _.get(body, "data.id");
      const imageUrl = _.get(body, "data.image_url");
      return {
        code: 200,
        body: storePut(sessionId, id, imageUrl)
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

  likeGif: async (sessionId, { id }) => {
    return {
      code: 200,
      body: storeLike(sessionId, id)
    };
  }

};

module.exports = grunt => ({
  backEnd: {
    options: {
      port: gruntConfig.env.backEndPort,
      hostname: gruntConfig.env.backEndHost,
      middleware: [
        (req, res, next) => {
          const log = msg => grunt.log.writeln(`[connect:backEnd] ${msg}`);
          log(`request: ${req.method} ${req.url}`);
          const { route, params } = router(req.method, req.url);
          if (!route) return next();
          const sessionId = req.headers["x-session-id"] || "defaultSession";
          const handler = handlers[route];
          if (!handler) return next();
          log(`handler: ${route} ${sessionId}`);
          handler(sessionId, params)
            .then(({ code, body }) => {
              res.statusCode = code;
              res.setHeader("access-control-allow-headers", "x-session-id, content-type");
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
});
