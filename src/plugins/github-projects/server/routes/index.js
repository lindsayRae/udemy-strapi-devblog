module.exports = [
  {
    method: "GET",
    path: "/repos", // /github-projects/repos
    handler: "getReposController.index",
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
  {
    method: "POST",
    path: "/project", // /github-projects/project
    handler: "projectController.create",
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
];
