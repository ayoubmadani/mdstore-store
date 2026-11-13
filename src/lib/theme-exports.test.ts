import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThemeRegistry } from './theme-exports.ts';

const Home = () => null;
const Main = () => null;
const url = '/api/themes/demo';

test('a theme that is not loaded yet has no component', () => {
  assert.equal(createThemeRegistry().component(url, 'Home'), null);
});

test('once the bundle is loaded, any of its exports is available at once', () => {
  const reg = createThemeRegistry();
  reg.remember(url, { default: Main, Home });
  assert.equal(reg.component(url, 'Home'), Home);
  assert.equal(reg.component(url, 'default'), Main);
});

test('a missing export falls back to default, then to Main', () => {
  const reg = createThemeRegistry();
  reg.remember(url, { default: Main });
  assert.equal(reg.component(url, 'Privacy'), Main);
  reg.remember('/api/themes/old', { Main });
  assert.equal(reg.component('/api/themes/old', 'Privacy'), Main);
});

test('an export that is not a component gives nothing', () => {
  const reg = createThemeRegistry();
  reg.remember(url, { pages: ['a', 'b'] });
  assert.equal(reg.component(url, 'pages'), null);
});

test('one theme never answers for another', () => {
  const reg = createThemeRegistry();
  reg.remember(url, { Home });
  assert.equal(reg.component('/api/themes/other', 'Home'), null);
});
