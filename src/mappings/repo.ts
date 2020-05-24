// Import entity types from the schema
import {
  Registry as RegistryEntity,
  Repo as RepoEntity,
  Version as VersionEntity,
} from "../types/schema";

// Import templates types
import {
  NewVersion as NewVersionEvent,
  Repo as RepoContract,
} from "../types/templates/Repo/Repo";
import { log } from "@graphprotocol/graph-ts";

export function handleNewVersion(event: NewVersionEvent): void {
  const repoId = event.address.toHex();
  const repo = RepoEntity.load(repoId);

  if (repo !== null) {
    const repoContract = RepoContract.bind(event.address);
    const versionData = repoContract.getByVersionId(event.params.versionId);

    const codeAddress = versionData.value1;
    const contentUri = versionData.value2.toString();
    const semanticVersion = event.params.semanticVersion.toString();

    const versionId = codeAddress
      .toHexString()
      .concat("-")
      .concat(semanticVersion);

    log.info("New version {} {}", [repo.name, semanticVersion]);

    // create new version
    let version = VersionEntity.load(versionId);
    if (version == null) {
      version = new VersionEntity(versionId) as VersionEntity;
      version.semanticVersion = semanticVersion;
      version.codeAddress = codeAddress;
      version.contentUri = contentUri;
      version.index = event.params.versionId.toI32();
      version.timestamp = event.block.timestamp.toI32();
      version.repoName = repo.name;
      version.repoAddress = repo.address;
      version.repoNamehash = repo.node;
      version.registryName = repo.registryName;
    }
    repo.versionCount = repo.versionCount + 1;
    repo.lastVersion = version.id;
    const versions = repo.versions;
    versions.push(repo.id);
    repo.versions = versions;

    let registry = RegistryEntity.load(repo.registryId);
    if (registry == null) {
      log.warning("Repo {} registry {} in null", [repoId, repo.registryId]);
    } else {
      registry.versionCount = registry.versionCount + 1;
      registry.save();
    }

    repo.save();
    version.save();
  }
}
