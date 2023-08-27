"use strict";

const { request } = require("@octokit/request");
const axios = require("axios").default;
const md = require("markdown-it")();

module.exports = ({ strapi }) => ({
  getProjectForRepo: async (repo) => {
    const { id } = repo;
    const matchingProjects = await strapi.entityService.findMany(
      "plugin::github-projects.project",
      {
        filters: {
          repositoryId: id,
        },
      }
    );
    if (matchingProjects.length == 1) return matchingProjects[0].id;
    return null;
  },

  getPublicRepos: async () => {
    try {
      const result = await request("GET /user/repos", {
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
        type: "public",
      });
      //! return result is working
      //return result;
      // we want: id, name, shortDescription, url, longDescription

      const filteredItems = result.data.filter(
        (item) => item.owner.login === "lindsayRae"
      );

      // need promise.all because we are mapping through awaited data
      return Promise.all(
        // if using 'result' make sure to grab data layer: result.data.map...
        filteredItems.map(async (item) => {
          const { id, name, description, html_url, owner, default_branch } =
            item;

          //! getting error from axios, hard coded for now
          // const readmeUrl = `https://raw.githubusercontent.com/${owner.login}/${name}/${default_branch}/README.md`;
          // @ts-ignore
          //const longDescription = await axios.get(readmeUrl);
          //const longDescription = md.render(await axios.get(readmeUrl).data).replaceAll("\n", "<br/>"); <- .data depending on if using result or filteredItems
          const longDescription = "This is my fake long description";
          const repo = {
            id,
            name,
            shortDescription: description,
            url: html_url,
            longDescription,
          };
          // Add some logic to search for an existing project for the current repo
          const relatedProjectsId = await strapi
            .plugin("github-projects")
            .service("getReposService")
            .getProjectForRepo(repo);
          return {
            ...repo,
            projectId: relatedProjectsId,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching public repos:", error);
      return [];
    }
  },
});
