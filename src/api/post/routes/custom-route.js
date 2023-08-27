// must add in controllers aswell

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/post/examples",
      handler: "api::post.post.exampleAction",
      config: {},
    },
  ],
};
