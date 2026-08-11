# Security Policy

## Supported Version

Security fixes are applied to the latest release and the `main` branch. Older
static snapshots are not maintained separately.

## Reporting a Vulnerability

Use GitHub's private vulnerability reporting for this repository:

<https://github.com/glacial7/paper-daily/security/advisories/new>

Include the affected file or workflow, reproduction steps, expected impact,
and any suggested mitigation. Do not include live credentials, private
subscription data, or unpublished research material in the report.

Please do not open a public issue until the report has been reviewed and a fix
or disclosure plan has been agreed. The maintainer will aim to acknowledge a
report within seven days, but response and remediation time will depend on the
scope and severity.

## Relevant Security Boundaries

Reports are especially useful when they concern:

- exposure of API keys, cookies, private feeds, or generated local data;
- workflow changes that could publish non-RSS or private source material;
- unsafe rendering of untrusted RSS or model-generated content;
- dependency or GitHub Actions supply-chain risks;
- bypasses of the public RSS-only verification checks.
