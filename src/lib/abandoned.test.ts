// node --test src/lib/abandoned.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectText, isDzMobile } from './abandoned-rules.ts';

test('a select still on its placeholder («اختر الولاية», value "") counts as empty', () => {
  assert.equal(selectText('', 'اختر الولاية'), '');
  assert.equal(selectText('16', 'الجزائر'), 'الجزائر');
  assert.equal(selectText('0', ' Adrar '), 'Adrar');
});

test('Algerian mobile numbers in every common format', () => {
  for (const v of ['0555123456', '+213555123456', '00213 555 12 34 56', '555123456']) assert.equal(isDzMobile(v), '0555123456', v);
  assert.equal(isDzMobile('0212345678'), null);
});
