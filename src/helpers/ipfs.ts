import { ipfs, log } from "@graphprotocol/graph-ts";

// Import entity types from the schema
import { IpfsHash as IpfsHashEntity } from "../types/schema";

export function getAppMetadata(
  contentUri: string,
  fileName: string
): string | null {
  log.info("IPFS resolving {}", [contentUri]);

  // if (
  //   contentHash != "repo" &&
  //   contentHash != "enssub" &&
  //   contentHash != "apm"
  // ) {

  // const ipfsPath = contentUri.concat("/").concat(fileName);

  const rawData = ipfs.cat(contentUri);
  log.info("Resolved {}: {}", [contentUri, rawData.toString()]);

  if (rawData == null) {
    log.warning("Content {} of {} was not resolved ", [contentUri, contentUri]);

    // save hash to try to resolve later
    let hash = IpfsHashEntity.load(contentUri);
    if (hash == null) {
      hash = new IpfsHashEntity(contentUri) as IpfsHashEntity;
    }
    hash.hash = contentUri;
    hash.save();

    return null;
  }

  return rawData.toString();
}
