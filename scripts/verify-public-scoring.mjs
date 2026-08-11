import assert from "node:assert/strict";
import fs from "node:fs";
import {
  canonicalJournalName,
  journalNameFromDoiPattern,
  journalPartitionScore
} from "./journal-index.mjs";
import {
  aliasJournalName,
  enrichPaperMetadata,
  inferInterpretivePaperType,
  inferJournalFromMetadataText
} from "./metadata-utils.mjs";

const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
assert.equal(/Nature Communications[^\n]+\\bNC\\b/.test(appSource), false);
assert.equal(/Nature Food[^\n]+\\bNF\\b/.test(appSource), false);

assert.equal(journalNameFromDoiPattern("10.1021/acs.est.6c02476"), "Environmental Science & Technology");
assert.equal(journalNameFromDoiPattern("10.1016/j.gca.2026.02.018"), "Geochimica et Cosmochimica Acta");
assert.equal(journalNameFromDoiPattern("10.3389/fpls.2025.1516775"), "Frontiers in Plant Science");
assert.equal(journalNameFromDoiPattern("10.1038/s41561-026-01992-5"), "");
assert.equal(journalNameFromDoiPattern("10.1038/s41559-026-01234-5"), "");

assert.equal(canonicalJournalName("GEOCHIMICA ET COSMOCHIMICA ACTA"), "Geochimica et Cosmochimica Acta");
assert.equal(aliasJournalName("Science of the Total Environment"), "Science of the Total Environment");
assert.equal(aliasJournalName("National Science Review"), "");
assert.equal(aliasJournalName("ScienceDaily reported an ecology study"), "");
assert.equal(aliasJournalName("NF: natural forest; NC: control"), "");
assert.equal(aliasJournalName("Science: ecosystem carbon feedbacks"), "Science");
assert.equal(aliasJournalName("Nature, published online 17 June 2026"), "Nature");
assert.equal(
  aliasJournalName("Nature Communications, 2025; DOI: 10.1038/s41467-025-67203-8"),
  "Nature Communications"
);

assert.equal(
  inferJournalFromMetadataText({
    title: "Fishing ban halts seven decades of biodiversity decline in the Yangtze River",
    text: "Published in Science. DOI: 10.1126/science.adu5160. Related reading includes Global Change Biology.",
    doi: "10.1126/science.adu5160"
  }),
  "Science"
);
assert.equal(
  enrichPaperMetadata({
    title: "Litter inputs alter soil aggregate carbon turnover",
    abstract: "Journal: Frontiers in Plant Science. DOI: 10.3389/fpls.2025.1516775. NF denotes natural forest.",
    doi: "10.3389/fpls.2025.1516775",
    journal: "SCIENCE",
    sourceSignals: [{ type: "professionalJournal", name: "Frontiers in Plant Science" }]
  }).journal,
  "Frontiers in Plant Science"
);

const commentary = inferInterpretivePaperType({
  title: "Plant species invasions and community composition processes",
  doi: "10.1073/pnas.2614644123",
  type: "Article",
  abstract:
    "Samuel M. Scheiner published this commentary to discuss and extend the related research article on plant invasions."
});
assert.equal(commentary?.paperTypeGroup, "commentary");

assert.equal(journalPartitionScore("Science").tier, "a1_nature_science");
assert.equal(journalPartitionScore("PNAS").tier, "a3_high_impact_selective");
assert.equal(journalPartitionScore("Biological Reviews").tier, "a2_top_selective");
assert.equal(journalPartitionScore("Ecology Letters").tier, "b1_nature_index");

console.log("Public scoring and metadata rules verified.");
