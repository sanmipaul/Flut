/**
 * VaultSettingsPanel
 *
 * A collapsible panel attached to a vault detail view. Users can set:
 *   - A nickname (short label shown in the sidebar and header)
 *   - A personal note / memo
 *   - A colour tag for quick visual identification
 *   - Compact number display preference
 *   - Pin the vault to the top of the sidebar list
 *
 * Settings are persisted to localStorage via useVaultSettings.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { useVaultSettings } from '../hooks/useVaultSettings';
import {
  VAULT_COLOR_TAGS,
  VAULT_COLOR_TAG_LABELS,
  VaultColorTag,
} from '../types/VaultSettings';

export interface VaultSettingsPanelProps {
  vaultId: number;
  /** Called whenever any setting changes so the parent can react */
  onSettingsChange?: () => void;
}

const VaultSettingsPanel: React.FC<VaultSettingsPanelProps> = ({
  vaultId,
  onSettingsChange,
}) => {
  const { settings, updateSettings, resetSettings } = useVaultSettings(vaultId);
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Collapse on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleUpdate = useCallback(
    <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
      updateSettings({ [key]: value } as Partial<typeof settings>);
      onSettingsChange?.();
    },
    [updateSettings, onSettingsChange]
  );

  const handleReset = useCallback(() => {
    resetSettings();
    onSettingsChange?.();
  }, [resetSettings, onSettingsChange]);

  return (
    <div className="vault-settings-panel" ref={panelRef}>
      <button
        className="vault-settings-panel__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={`vault-settings-${vaultId}`}
      >
        <span className="vault-settings-panel__toggle-label">Vault Settings</span>
        <span
          className={`vault-settings-panel__caret ${isOpen ? 'vault-settings-panel__caret--open' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        id={`vault-settings-${vaultId}`}
        className={`vault-settings-panel__body ${isOpen ? 'vault-settings-panel__body--open' : ''}`}
        hidden={!isOpen}
      >
        <fieldset className="settings-fieldset">
          <legend className="settings-fieldset__legend">Display</legend>

          {/* Nickname */}
          <div className="settings-row">
            <label htmlFor={`nickname-${vaultId}`} className="settings-label">
              Nickname
            </label>
            <input
              id={`nickname-${vaultId}`}
              type="text"
              className="settings-input"
              value={settings.nickname}
              maxLength={40}
              placeholder="e.g. Emergency Fund"
              aria-describedby={`nickname-count-${vaultId}`}
              onChange={(e) => handleUpdate('nickname', e.target.value)}
            />
            <span
              id={`nickname-count-${vaultId}`}
              className="settings-char-count"
              aria-live="polite"
            >
              {settings.nickname.length}/40
            </span>
          </div>

          {/* Compact display */}
          <div className="settings-row settings-row--inline">
            <label htmlFor={`compact-${vaultId}`} className="settings-label">
              Compact amounts
            </label>
            <input
              id={`compact-${vaultId}`}
              type="checkbox"
              className="settings-checkbox"
              checked={settings.compactDisplay}
              onChange={(e) => handleUpdate('compactDisplay', e.target.checked)}
            />
          </div>

          {/* Pinned */}
          <div className="settings-row settings-row--inline">
            <label htmlFor={`pinned-${vaultId}`} className="settings-label">
              Pin to top
            </label>
            <input
              id={`pinned-${vaultId}`}
              type="checkbox"
              className="settings-checkbox"
              checked={settings.pinned}
              onChange={(e) => handleUpdate('pinned', e.target.checked)}
            />
          </div>
        </fieldset>

        {/* Color tag */}
        <fieldset className="settings-fieldset">
          <legend className="settings-fieldset__legend">Colour Tag</legend>
          <div className="color-tag-picker" role="group" aria-label="Vault colour tag">
            {VAULT_COLOR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`color-tag-btn color-tag-btn--${tag} ${settings.colorTag === tag ? 'color-tag-btn--selected' : ''}`}
                onClick={() => handleUpdate('colorTag', tag as VaultColorTag)}
                aria-pressed={settings.colorTag === tag}
                aria-label={VAULT_COLOR_TAG_LABELS[tag]}
                title={VAULT_COLOR_TAG_LABELS[tag]}
              />
            ))}
          </div>
        </fieldset>

        {/* Note */}
        <fieldset className="settings-fieldset">
          <legend className="settings-fieldset__legend">Personal Note</legend>
          <textarea
            id={`note-${vaultId}`}
            className="settings-textarea"
            value={settings.note}
            maxLength={300}
            placeholder="Add a private reminder or note about this vault…"
            rows={3}
            onChange={(e) => handleUpdate('note', e.target.value)}
          />
          <span className="settings-char-count">
            {settings.note.length}/300
          </span>
        </fieldset>

        <div className="settings-actions">
          <button
            type="button"
            className="btn-ghost btn-small"
            onClick={handleReset}
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultSettingsPanel;
