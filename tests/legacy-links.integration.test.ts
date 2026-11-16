import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import neo4j from 'neo4j-driver';
import type { Auth } from '../../../server/auth.js';
import { addressDocuments } from '../../../server/address-routes.js';
import { IdentityStore } from '../../../server/identity-store.js';
import { connectPlugins } from '../../../server/plugin.js';
import { composition } from '../testing.js';

const uri = process.env.KANNABI_TEST_NEO4J_URI;
const password = process.env.KANNABI_TEST_NEO4J_PASSWORD;

const documentPath = join(mkdtempSync(join(tmpdir(), 'kannabi-depot-')), 'index.html');
writeFileSync(documentPath, '<!doctype html><title>Kannabi</title>');
const anonymous = { api: { getSession: async () => null } } as unknown as Auth;
const gtin = '00614141123452';

/** depot's printed links, through the real document middleware with GS1 and
 * depot composed, over a real socket: a doubled slash and an encoded serial
 * are what Node and Hono hand the middleware, not what a test builds. */
test('a depot legacy link reaches a public Asset and discloses nothing else',
  { skip: !uri || !password }, async (t) => {
    const driver = neo4j.driver(uri!, neo4j.auth.basic('neo4j', password!));
    t.after(() => driver.close());
    const store = await IdentityStore.open(driver, composition);
    const plugins = connectPlugins(composition, store);
    const person = await store.createUser('Robin');
    const group = await store.createReportingGroup('Lab', person.key);
    const context = { actorKey: person.key, groupKey: group.key };
    const shown = await store.reportAsset({ name: 'Milling machine',
      identifiers: [{ scheme: 'sgtin', gtin, serial: 'login.8' }] }, context);
    await store.updateAsset(shown.id, { isPublic: true }, person.key);
    await store.reportAsset({ name: 'Private bench',
      identifiers: [{ scheme: 'sgtin', gtin, serial: 'a/b' }] }, context);

    const app = new Hono();
    app.use('*', addressDocuments(store, anonymous, plugins, documentPath));
    app.get('*', (c) => c.text('rendered by the application'));
    const server = serve({ fetch: app.fetch, port: 0, hostname: '127.0.0.1' });
    t.after(() => new Promise((resolve) => server.close(() => resolve(null))));
    await new Promise((resolve) => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const get = (path: string) => fetch(origin + path, { redirect: 'manual' });

    // As printed on the QR code, and as mailed with a second slash: rendered
    // in place, never redirected.
    for (const path of [`/01${gtin}21login.8`, `//01${gtin}21login.8`]) {
      const response = await get(path);
      assert.equal(response.status, 200, path);
      assert.equal(await response.text(), 'rendered by the application', path);
    }
    // A private Asset, an SGTIN nobody holds and a value GS1 refuses answer
    // alike, so a label tells an outsider nothing.
    for (const path of [`/01${gtin}21a%2Fb`, `/01${gtin}21nobody`, `/0100614141123453` + '21login.8']) {
      const response = await get(path);
      assert.equal(response.status, 404, path);
      assert.equal(response.headers.get('cache-control'), 'no-store', path);
    }
    // Anything else is not depot's, and routing carries on.
    assert.equal((await get('/lookup')).status, 200);
  });
