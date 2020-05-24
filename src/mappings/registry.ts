import {
  Registry as RegistryEntity,
  Repo as RepoEntity,
} from "../types/schema";
import { Repo as RepoTemplate } from "../types/templates";
import {
  NewRepo as NewRepoEvent,
  NewAppProxy as NewAppProxyEvent,
} from "../types/dnp.dappnode.eth/APMRegistry";
import { log } from "@graphprotocol/graph-ts";
import { getRegistryName } from "../helpers/getRegistryName";

export function handleNewRepo(event: NewRepoEvent): void {
  const registryAddress = event.address.toHex();
  const registryId = registryAddress;
  let registry = RegistryEntity.load(registryId);
  if (registry == null) {
    registry = new RegistryEntity(registryId) as RegistryEntity;
    registry.address = event.address;
    registry.repoCount = 0;
    registry.versionCount = 0;
    registry.repos = [];
    registry.name = getRegistryName(registryAddress);
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
    repo.timestamp = event.block.timestamp.toI32();
    repo.txHash = event.transaction.hash;
    repo.sender = event.transaction.from;
    repo.registryName = registry.name;
    repo.registryId = registryId;
    repo.versionCount = 0;
    repo.versions = [];
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
