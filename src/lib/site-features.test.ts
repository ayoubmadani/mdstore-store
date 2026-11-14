import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FEATURE_GROUP_IDS } from './site-features.ts';

// صفحة «المزايا» في الموقع: نفس المجموعات ونفس عدد البنود في اللغات الثلاث،
// حتى لا تظهر ميزة بلغة وتغيب بأخرى، ولا مجموعة بلا أيقونة.
const LOCALES = ['ar', 'fr', 'en'] as const;
const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const messages = (locale: string, ns: string) => JSON.parse(read(`../messages/${locale}/${ns}.json`));

test('every language lists the same feature groups, in the page order', () => {
  for (const l of LOCALES) {
    assert.deepEqual(messages(l, 'features').groups.map((g: any) => g.id), [...FEATURE_GROUP_IDS], l);
  }
});

test('a group has the same number of features in every language, none empty', () => {
  const ar = messages('ar', 'features').groups;
  for (const l of LOCALES) {
    messages(l, 'features').groups.forEach((g: any, i: number) => {
      assert.ok(g.title?.trim() && g.desc?.trim(), `${l}/${g.id} title+desc`);
      assert.equal(g.items.length, ar[i].items.length, `${l}/${g.id} item count`);
      assert.ok(g.items.length >= 4, `${l}/${g.id} has too few items`);
      g.items.forEach((it: string) => assert.ok(it.trim().length > 3, `${l}/${g.id} empty item`));
    });
  }
});

test('the page is reachable: nav label in every language, namespace loaded, in the sitemap', () => {
  for (const l of LOCALES) {
    assert.ok(messages(l, 'nav').features?.trim(), `${l} nav.features`);
    assert.ok(messages(l, 'home').all_features?.trim(), `${l} home.all_features`);
  }
  assert.match(read('../i18n/request.ts'), /'features'/);
  assert.match(read('../app/sitemap.ts'), /'\/features'/);
});

test('features that are switched off or unverified are not advertised', () => {
  for (const l of LOCALES) {
    const text = read(`../messages/${l}/features.json`);
    assert.doesNotMatch(text, /Meta Ads|إعلانات Meta|Publicités Meta/i, `${l}: Meta Ads is off in the dashboard`);
    assert.doesNotMatch(text, /Tunis|تونس/i, `${l}: Tunisia is not confirmed open to merchants`);
    assert.doesNotMatch(text, /gmail\.com/i, `${l}: no personal email`);
  }
});
