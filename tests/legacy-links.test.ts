import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchRoutes } from 'react-router';
import { compose } from '../../../server/plugin.js';
import { gs1Plugin } from '../../gs1/index.js';
import { gs1Addresses } from '../../gs1/adapter/addresses.js';
import { depotPlugin } from '../index.js';
import { composition } from '../testing.js';
import { legacyLinks } from '../adapter/addresses.js';
import { legacySgtin } from '../links/legacy-link.js';

// A GS1 example GTIN with a valid check digit. depot's printed form drops the
// element string's parentheses and puts the rest after its domain.
const gtin = '00614141123452';
const links = legacyLinks(composition.schemes);

test('a depot legacy link names the SGTIN it was printed from, exactly as printed', () => {
  assert.deepEqual(legacySgtin(`/01${gtin}21A1B2`), { gtin, serial: 'A1B2' });
  // A grant mail put a second slash after the domain.
  assert.deepEqual(legacySgtin(`//01${gtin}21A1B2`), { gtin, serial: 'A1B2' });
  // A serial that itself starts with 21 is still everything after the first.
  assert.deepEqual(legacySgtin(`/01${gtin}2121`), { gtin, serial: '21' });
  // Case, dots and leading zeros are kept; an encoded character is decoded once.
  assert.deepEqual(legacySgtin(`/01${gtin}21login.08`), { gtin, serial: 'login.08' });
  assert.deepEqual(legacySgtin(`/01${gtin}21a%2Fb`), { gtin, serial: 'a/b' });
  assert.equal(legacySgtin(`/01${gtin}21a%ZZ`), 'malformed');
});

test('a path in any other form is not a legacy link', () => {
  for (const path of ['/', '/lookup', '/groups', `/01/${gtin}/21/A1B2`, `/01${gtin}`, `/01${gtin}21`,
    `/01${gtin.slice(1)}21A1B2`, `/asset/01${gtin}21A1B2`, `/01${gtin}21A/B`, `///01${gtin}21A1B2`,
    `/8003${gtin}21A1B2`]) {
    assert.equal(legacySgtin(path), null, path);
    assert.equal(links.claim(path), null, path);
  }
});

test('a legacy link is claimed as the SGTIN the GS1 plugin accepts', () => {
  const claim = links.claim(`/01${gtin}21A1B2`);
  assert.equal(claim?.kind, 'identifier');
  assert.deepEqual(claim?.kind === 'identifier' && {
    scheme: claim.identifier.scheme, canonical: claim.identifier.canonical, level: claim.identifier.level,
  }, { scheme: 'sgtin', canonical: `(01)${gtin}(21)A1B2`, level: 'individual' });
});

test('a legacy link GS1 refuses, or one that cannot be decoded, names nothing rather than being malformed', () => {
  // A wrong check digit, a serial longer than GS1 allows, and a bad escape.
  for (const path of [`/0100614141123453` + '21A1B2', `/01${gtin}21${'x'.repeat(21)}`, `/01${gtin}21a%ZZ`]) {
    assert.deepEqual(links.claim(path), { kind: 'notFound' }, path);
  }
});

test('the GS1 plugin does not claim a legacy link, and depot does not claim a Digital Link', () => {
  assert.equal(gs1Addresses.claim(`/01${gtin}21A1B2`), null);
  assert.equal(links.claim(`/01/${gtin}/21/A1B2`), null);
});

test('depot is composed only after the GS1 plugin it requires', () => {
  assert.doesNotThrow(() => compose([gs1Plugin, depotPlugin]));
  assert.throws(() => compose([depotPlugin]), /requires "gs1"/);
  assert.throws(() => compose([depotPlugin, gs1Plugin]), /requires "gs1"/);
});

test('the web route takes a legacy link with one slash or two, and loses to every declared route', () => {
  const routes = [{ path: 'lookup' }, { path: 'asset/:id' }, { path: '01/:gtin/21/:serial' },
    { path: '*', id: 'depot-legacy-link' }];
  for (const path of [`/01${gtin}21A1B2`, `//01${gtin}21A1B2`]) {
    assert.equal(matchRoutes(routes, path)?.at(-1)?.route.id, 'depot-legacy-link', path);
  }
  for (const [path, owner] of [['/lookup', 'lookup'], ['/asset/x', 'asset/:id'],
    [`/01/${gtin}/21/A1B2`, '01/:gtin/21/:serial']]) {
    assert.equal(matchRoutes(routes, path)?.at(-1)?.route.path, owner, path);
  }
});
