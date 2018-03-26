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

const storeGetAll = bucketId => gifStores[bucketId] || [];

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

  fetchGif: async (bucketId, { category = "cat" }) => {
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
    return {
      code: 200,
      body: storeLike(bucketId, id)
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
});
