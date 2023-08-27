"use strict";

/**
 * post controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

// @ts-ignore
module.exports = createCoreController("api::post.post", ({ strapi }) => ({
  // when creating a custom route, you must create the below AND file in /routes
  // Method 1: creating an entirely custom action
  async exampleAction(ctx) {
    console.log("I was called");
    await strapi
      .service("api::post.post")
      .exampleService({ myParam: "example" });
    try {
      ctx.body = "ok";
    } catch (error) {
      ctx.body = error;
    }
  },

  // Solution 1: fetched all posts and filtered them afterwards
  // not the best method
  //   async find(ctx) {
  //     // fetch all posts including premium ones
  //     // @ts-ignore
  //     const { data, meta } = await super.find(ctx);
  //     if (ctx.state.user) return { data, meta };
  //     // not authenticated
  //     const filteredData = data.filter((post) => !post.attributes.premium);
  //     return { data: filteredData, meta };
  //   },

  // Solution 2: rewrite the action to fetch only needed posts
  //   async find(ctx) {
  //     // if the request is authenticated
  //     const isRequestingNonPremium =
  //       ctx.query.filters && ctx.query.filters.premium["$eq"] == false;
  //     // @ts-ignore
  //     if (ctx.state.user || isRequestingNonPremium) return await super.find(ctx);
  //     // if the request is public...
  //     // ... lets call the underlying service with an additional filter param: premium == false
  //     // /post? filters[premium]=false
  //     const { query } = ctx;
  //     const filteredPosts = await strapi.service("api::post.post").find({
  //       ...query,
  //       filters: {
  //         ...query.filters,
  //         premium: false,
  //       },
  //     });
  //     // @ts-ignore
  //     const sanitizedPosts = await this.sanitizeOutput(filteredPosts, ctx);
  //     // @ts-ignore
  //     return this.transformResponse(sanitizedPosts);
  //   },

  // Solution 3:
  async find(ctx) {
    // if the request is authenticated or explicitly asking for public content only
    const isRequestingNonPremium =
      // @ts-ignore
      ctx.query.filters && ctx.query.filters.premium == false;
    // @ts-ignore
    if (ctx.state.user || isRequestingNonPremium) return await super.find(ctx);
    // if the request is public...
    const publicPosts = await strapi
      .service("api::post.post")
      .findPublic(ctx.query);
    // @ts-ignore
    const sanitizedPosts = await this.sanitizeOutput(publicPosts, ctx);
    // @ts-ignore
    return this.transformResponse(sanitizedPosts);
  },

  //   async findOne(ctx) {
  //     // '/posts/:id' /posts/1?
  //     const { id } = ctx.params;
  //     const { query } = ctx;

  //     const entity = await strapi.service("api::post.post").findOne(id, query);
  //     // @ts-ignore
  //     const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

  //     // @ts-ignore
  //     return this.transformResponse(sanitizedEntity);
  //   },
  // Method 3: Replacing a core action
  async findOne(ctx) {
    // @ts-ignore
    if (ctx.state.user) return await super.findOne(ctx);
    //else...
    const { id } = ctx.params; // /posts/:id
    const { query } = ctx;
    const postIfPublic = await strapi
      .service("api::post.post")
      .findOneIfPublic({
        id,
        query,
      });
    // @ts-ignore
    const sanitizedEntity = await this.sanitizeOutput(postIfPublic, ctx);
    // @ts-ignore
    return this.transformResponse(sanitizedEntity);
  },

  async likePost(ctx) {
    const user = ctx.state.user;
    const postId = ctx.params.id;
    const { query } = ctx;
    const updatedPost = await strapi.service("api::post.post").likePost({
      postId,
      userId: user.id,
      query,
    });
    // @ts-ignore
    const sanitizedEntity = await this.sanitizeOutput(updatedPost, ctx);
    // @ts-ignore
    return this.transformResponse(sanitizedEntity);
  },
}));
