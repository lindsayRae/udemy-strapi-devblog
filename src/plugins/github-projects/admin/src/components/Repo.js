// @ts-nocheck
import React, { useState, useEffect } from "react";

// @ts-ignore
import { Table, Thead, Tbody, Tr, Td, Th } from "@strapi/design-system";
import {
  Box,
  Typography,
  BaseCheckbox,
  Loader,
  Alert,
  Link,
  Flex,
  IconButton,
} from "@strapi/design-system";
import axios from "../utils/axiosInstance";
import { Pencil, Trash, Plus } from "@strapi/icons";

const COL_COUNT = 5;

const Repo = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [selectedRepos, setSelectedRepos] = useState([]);

  const createProject = async (repo) => {
    console.log("createProject heard", repo);
    try {
      const response = await axios.post("/github-projects/project", repo);
      // const response = await fetch("/github-projects/project", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(repo),
      // });
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(async () => {
    setLoading(true);
    //fetch data
    axios
      .get("/github-projects/repos")
      .then((response) => setRepos(response.data))
      .catch((error) => setError(error));
    setLoading(false);
  }, []);

  if (error)
    return (
      <Alert
        closeLabel="Close alert"
        title="Error fetching repositories"
        variant="danger"
      >
        {error.toString()}
      </Alert>
    );

  if (loading) return <Loader />;

  // we do have some repos
  console.log(repos);

  const allChecked = selectedRepos.length == repos.length;
  const isIndeterminate = selectedRepos.length > 0 && !allChecked; // some repos selected, but not all

  return (
    <Box padding={8} background="neutral100">
      <Table colCount={COL_COUNT} rowCount={repos.length}>
        <Thead>
          <Tr>
            <Th>
              <BaseCheckbox
                aria-label="Select all entries"
                value={allChecked}
                indeterminate={isIndeterminate}
                onValueChange={(value) =>
                  value
                    ? setSelectedRepos(repos.map((repo) => repo.id))
                    : setSelectedRepos([])
                }
              />
            </Th>
            <Th>
              <Typography variant="sigma">Name</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Description</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Url</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Actions</Typography>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {repos.map((repo) => {
            const { id, name, shortDescription, url, projectId } = repo;
            return (
              <Tr key={id}>
                <Td>
                  <BaseCheckbox
                    aria-label={`Select ${id}`}
                    value={selectedRepos.includes(id)}
                    onValueChange={(value) => {
                      const newSelectedRepos = value
                        ? [...selectedRepos, id]
                        : selectedRepos.filter((item) => item !== id);
                      setSelectedRepos(newSelectedRepos);
                    }}
                  />
                </Td>
                <Td>
                  <Typography textColor="neutral800">{name}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {shortDescription}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    <Link href={url} isExternal>
                      {url}
                    </Link>
                  </Typography>
                </Td>

                <Td>
                  {projectId ? (
                    <Flex>
                      <Link
                        to={`/content-manager/collectionType/plugin::github-projects.project/${projectId}`}
                      >
                        <IconButton
                          onClick={() => console.log("edit")}
                          label="Edit"
                          noBorder
                          icon={<Pencil />}
                        />
                      </Link>

                      <Box paddingLeft={1}>
                        <IconButton
                          onClick={() => console.log("delete")}
                          label="Delete"
                          noBorder
                          icon={<Trash />}
                        />
                      </Box>
                    </Flex>
                  ) : (
                    <IconButton
                      onClick={() => createProject(repo)}
                      label="Add"
                      noBorder
                      icon={<Plus />}
                    />
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Repo;
