import { displayName } from './names';

test('strips the id suffix', () => {
  expect(displayName('Alice#1a2b3c4d')).toBe('Alice');
});

test('keeps a # the user typed in their own name', () => {
  expect(displayName('C#dev#1a2b3c4d')).toBe('C#dev');
});

test('returns a name without a suffix unchanged', () => {
  expect(displayName('Alice')).toBe('Alice');
});
