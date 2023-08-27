"use strict";

module.exports = ({ strapi }) => ({
  create: async (ctx) => {
    // crete new project
    const repo = ctx.request.body;
    console.log("controller repo: ", repo);
  },
});
