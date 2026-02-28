import { renderHook, act, waitFor } from '@testing-library/react';
import { useVaultImport } from './useVaultImport';
import { serializeVaultExport, serializeToJson, VaultSnapshot } from '../utils/vaultExport';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

function makeFile(content: string, name = 'backup.json', type = 'application/json'): File {
  return new File([content], name, { type });
}

const sampleVaults: VaultSnapshot[] = [
  { vaultId: 1, creator: 'SP1', amount: 500, unlockHeight: 100, createdAt: 5, isWithdrawn: false, currentBlockHeight: 10 },
];

describe('useVaultImport', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useVaultImport());
    expect(result.current.importState).toBe('idle');
  });

  it('importFile(undefined) does nothing', () => {
    const { result } = renderHook(() => useVaultImport());
    act(() => { result.current.importFile(undefined); });
    expect(result.current.importState).toBe('idle');
  });

  it('non-json file sets state to error', async () => {
    const { result } = renderHook(() => useVaultImport());
    act(() => { result.current.importFile(makeFile('data', 'backup.txt', 'text/plain')); });
    await waitFor(() => expect(result.current.importState).toBe('error'));
    expect(result.current.importError).toContain('.json');
  });

  it('valid backup sets state to success', async () => {
    const data = serializeVaultExport(sampleVaults);
    const json = serializeToJson(data);
    const { result } = renderHook(() => useVaultImport());
    act(() => { result.current.importFile(makeFile(json)); });
    await waitFor(() => expect(result.current.importState).toBe('success'));
    expect(result.current.importedData).not.toBeNull();
  });

  it('invalid JSON sets state to error', async () => {
    const { result } = renderHook(() => useVaultImport());
    act(() => { result.current.importFile(makeFile('NOT_JSON{{{}')); });
    await waitFor(() => expect(result.current.importState).toBe('error'));
  });

  it('restoredCount equals vault count in a valid import', async () => {
    const data = serializeVaultExport(sampleVaults);
    const json = serializeToJson(data);
    const { result } = renderHook(() => useVaultImport());
    act(() => { result.current.importFile(makeFile(json)); });
    await waitFor(() => expect(result.current.importState).toBe('success'));
    expect(result.current.restoredCount).toBe(sampleVaults.length);
  });

  it('reset restores idle state', async () => {
    const data = serializeVaultExport(sampleVaults);
    const json = serializeToJson(data);
    const { result } = renderHook(() => useVaultImport());
    act(() => { result.current.importFile(makeFile(json)); });
    await waitFor(() => expect(result.current.importState).toBe('success'));
    act(() => { result.current.reset(); });
    expect(result.current.importState).toBe('idle');
    expect(result.current.importedData).toBeNull();
  });
});
