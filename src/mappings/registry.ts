import {
  Registry as RegistryEntity,
  Repo as RepoEntity,
} from "../types/schema";
import { log } from "@graphprotocol/graph-ts";
import { Repo as RepoTemplate } from "../types/templates";
import { NewRepo as NewRepoEvent } from "../types/templates/Registry/APMRegistry";
import {
  DNP_REGISTRY_ADDRESS,
  PUBLIC_REGISTRY_ADDRESS,
} from "../helpers/constants";

export function handleNewRepo(event: NewRepoEvent): void {
  const registryId = event.address.toHex();
  let registry = RegistryEntity.load(registryId);
  if (registry == null) {
    // solve registry name
    let name = "";
    if (registryId == DNP_REGISTRY_ADDRESS) {
      name = "dnp.dappnode.eth";
    } else if (registryId == PUBLIC_REGISTRY_ADDRESS) {
      name = "public.dappnode.eth";
    }
    registry = new RegistryEntity(registryId);
    registry.address = event.address;
    registry.name = name;
    registry.repoCount = 0;
    registry.repos = [];
    log.debug("New registry entity at", [registryId]);
  }

  registry.repoCount = registry.repoCount + 1;

  const repoId = event.params.repo.toHex();
  const repoAddress = event.params.repo;

  // create new repo
  let repo = RepoEntity.load(repoId);
  if (repo == null) {
    repo = new RepoEntity(repoId);
    repo.address = repoAddress;
    repo.name = event.params.name;
    repo.node = event.params.id;
    log.debug("New repo {}, at {}", [repo.name, repoAddress.toHex()]);
  }

  // add the repo for the derived relationship
  const currentRepos = registry.repos;
  currentRepos.push(repo.id);
  registry.repos = currentRepos;

  // save to the store
  registry.save();
  repo.save();

  RepoTemplate.create(repoAddress);
}
