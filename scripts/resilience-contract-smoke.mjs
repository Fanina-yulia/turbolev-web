import assert from 'node:assert/strict';
import { dependencyFailureContract, resolveDependencyFailure } from '../lib/resilience/degradation-contract.mjs';

const requiredDependencies = ['search', 'vin', 'fitment', 'ai', 'analytics'];

for (const dependency of requiredDependencies) {
  assert.ok(dependencyFailureContract[dependency], `${dependency} must have a failure contract`);
  const state = resolveDependencyFailure(dependency);
  assert.equal(state.keepsPublicContentAvailable, true, `${dependency} outage must not take down public content`);
  assert.equal(state.positiveClaimAllowed, false, `${dependency} outage must never create an unverified positive claim`);
  assert.equal(state.preservesContext, true, `${dependency} outage must preserve user context`);
}

assert.equal(resolveDependencyFailure('search').fallback, 'category-navigation', 'SRE-QA-002: search outage must fall back to category navigation');
assert.equal(resolveDependencyFailure('vin').fallback, 'manual-vehicle-selection', 'SRE-QA-003: VIN outage must offer manual selection');
assert.equal(resolveDependencyFailure('fitment').blocksCompatibilityCriticalCommit, true, 'SRE-QA-004: fitment outage must fail closed for compatibility-critical commit');
assert.equal(resolveDependencyFailure('ai').fallback, 'classic-storefront', 'SRE-QA-009: AI outage must leave classic storefront available');
assert.equal(resolveDependencyFailure('analytics').blocksTransaction, false, 'SRE-QA-012: analytics outage must never block a transaction');

const unknown = resolveDependencyFailure('unregistered-provider');
assert.equal(unknown.unknownDependency, true, 'unknown dependency must be explicit');
assert.equal(unknown.fallback, 'fail-closed', 'unknown dependency must fail closed');
assert.equal(unknown.positiveClaimAllowed, false, 'unknown dependency must not generate a positive claim');

console.log('QA-SRE-001 resilience contract smoke passed:', requiredDependencies.join(', '));
