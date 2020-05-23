// Import entity types from the schema
import {
  Registry as RegistryEntity,
  Repo as RepoEntity,
} from "../types/schema";

// Import templates types
import { Repo as RepoTemplate } from "../types/templates";
// Import event types
import {
  NewRepo as NewRepoEvent,
  NewAppProxy as NewAppProxyEvent,
} from "../types/templates/Registry/APMRegistry";
import { log } from "@graphprotocol/graph-ts";

export function handleNewRepo(event: NewRepoEvent): void {
  const registryId = event.address.toHex();
  let registry = RegistryEntity.load(registryId);
  if (registry == null) {
    registry = new RegistryEntity(registryId) as RegistryEntity;
    registry.address = event.address;
    registry.repoCount = 0;
    registry.repos = [];
    // Mock values to test
    registry.node = event.transaction.hash;
    registry.name = "";
  }
  registry.repoCount = registry.repoCount + 1;

  const repoId = event.params.repo.toHex();
  const repoAddress = event.params.repo;

  // create new repo
  let repo = RepoEntity.load(repoId);
  if (repo == null) {
    repo = new RepoEntity(repoId) as RepoEntity;
    repo.address = repoAddress;
    repo.name = event.params.name;
    repo.node = event.params.id;
  }

  log.info("New repo {}", [repo.name]);

  // add the repo for the derived relationship
  const currentRepos = registry.repos;
  currentRepos.push(repo.id);
  registry.repos = currentRepos;

  // save to the store
  registry.save();
  repo.save();

  RepoTemplate.create(repoAddress);
}

export function handleNewProxyApp(event: NewAppProxyEvent): void {}
