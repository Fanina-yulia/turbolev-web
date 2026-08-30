export const dependencyFailureContract = Object.freeze({
  search: Object.freeze({
    failureMode: 'FM-003',
    severity: 'SEV2',
    keepsPublicContentAvailable: true,
    positiveClaimAllowed: false,
    fallback: 'category-navigation',
    preservesContext: true,
  }),
  vin: Object.freeze({
    failureMode: 'FM-004',
    severity: 'SEV2',
    keepsPublicContentAvailable: true,
    positiveClaimAllowed: false,
    fallback: 'manual-vehicle-selection',
    preservesContext: true,
  }),
  fitment: Object.freeze({
    failureMode: 'FM-005',
    severity: 'SEV2',
    keepsPublicContentAvailable: true,
    positiveClaimAllowed: false,
    fallback: 'browse-without-fitment-claim',
    preservesContext: true,
    blocksCompatibilityCriticalCommit: true,
  }),
  ai: Object.freeze({
    failureMode: 'FM-012',
    severity: 'SEV2',
    keepsPublicContentAvailable: true,
    positiveClaimAllowed: false,
    fallback: 'classic-storefront',
    preservesContext: true,
  }),
  analytics: Object.freeze({
    failureMode: 'FM-016',
    severity: 'SEV3',
    keepsPublicContentAvailable: true,
    positiveClaimAllowed: false,
    fallback: 'continue-without-marketing-beacon',
    preservesContext: true,
    blocksTransaction: false,
  }),
});

export function resolveDependencyFailure(dependency) {
  const contract = dependencyFailureContract[dependency];
  if (!contract) {
    return Object.freeze({
      failureMode: 'UNMAPPED',
      severity: 'SEV1',
      keepsPublicContentAvailable: true,
      positiveClaimAllowed: false,
      fallback: 'fail-closed',
      preservesContext: true,
      unknownDependency: true,
    });
  }

  return contract;
}
