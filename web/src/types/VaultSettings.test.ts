import {
  defaultVaultSettings,
  VAULT_COLOR_TAGS,
  VAULT_COLOR_TAG_LABELS,
} from './VaultSettings';

describe('VaultSettings', () => {
  describe('defaultVaultSettings', () => {
    it('returns empty nickname', () => {
      expect(defaultVaultSettings().nickname).toBe('');
    });

    it('returns empty note', () => {
      expect(defaultVaultSettings().note).toBe('');
    });

    it('returns colorTag of none', () => {
      expect(defaultVaultSettings().colorTag).toBe('none');
    });

    it('returns compactDisplay false', () => {
      expect(defaultVaultSettings().compactDisplay).toBe(false);
    });

    it('returns pinned false', () => {
      expect(defaultVaultSettings().pinned).toBe(false);
    });

    it('produces a fresh object each call', () => {
      const a = defaultVaultSettings();
      const b = defaultVaultSettings();
      expect(a).not.toBe(b);
    });
  });

  describe('VAULT_COLOR_TAGS', () => {
    it('includes none as the first tag', () => {
      expect(VAULT_COLOR_TAGS[0]).toBe('none');
    });

    it('includes all six variants', () => {
      expect(VAULT_COLOR_TAGS).toHaveLength(6);
    });

    it('contains red, green, blue, orange, purple', () => {
      expect(VAULT_COLOR_TAGS).toContain('red');
      expect(VAULT_COLOR_TAGS).toContain('green');
      expect(VAULT_COLOR_TAGS).toContain('blue');
      expect(VAULT_COLOR_TAGS).toContain('orange');
      expect(VAULT_COLOR_TAGS).toContain('purple');
    });
  });

  describe('VAULT_COLOR_TAG_LABELS', () => {
    it('has a label for every tag', () => {
      VAULT_COLOR_TAGS.forEach((tag) => {
        expect(VAULT_COLOR_TAG_LABELS[tag]).toBeTruthy();
      });
    });

    it('labels are human-readable strings', () => {
      Object.values(VAULT_COLOR_TAG_LABELS).forEach((label) => {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });
});
