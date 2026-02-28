import { renderHook, act } from '@testing-library/react';
import { useVaultExport } from './useVaultExport';
import { VaultSnapshot } from '../utils/vaultExport';

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

// Mock browser download APIs
let capturedBlob: Blob | null = null;
let capturedFilename = '';
const mockAnchor = {
  href: '',
  download: '',
  click: jest.fn(),
};

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  capturedBlob = null;
  capturedFilename = '';

  jest.spyOn(document.body, 'appendChild').mockImplementation((el) => {
    const a = el as HTMLAnchorElement;
    capturedFilename = a.download;
    return el;
  });
  jest.spyOn(document.body, 'removeChild').mockImplementation((el) => el);
  jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);

  // @ts-ignore
  global.URL.createObjectURL = jest.fn((blob: Blob) => {
    capturedBlob = blob;
    return 'blob:mock-url';
  });
  // @ts-ignore
  global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const sampleVaults: VaultSnapshot[] = [
  {
    vaultId: 1,
    creator: 'SP1',
    amount: 1000,
    unlockHeight: 50,
    createdAt: 5,
    isWithdrawn: false,
    currentBlockHeight: 10,
  },
];

describe('useVaultExport', () => {
  it('starts with isExporting=false', () => {
    const { result } = renderHook(() => useVaultExport(sampleVaults));
    expect(result.current.isExporting).toBe(false);
  });

  it('starts with no exportError', () => {
    const { result } = renderHook(() => useVaultExport(sampleVaults));
    expect(result.current.exportError).toBe('');
  });

  it('exportVaults creates an object URL', () => {
    const { result } = renderHook(() => useVaultExport(sampleVaults));
    act(() => { result.current.exportVaults(); });
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('exportVaults triggers anchor click', () => {
    const { result } = renderHook(() => useVaultExport(sampleVaults));
    act(() => { result.current.exportVaults(); });
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('exportVaults revokes the object URL after download', () => {
    const { result } = renderHook(() => useVaultExport(sampleVaults));
    act(() => { result.current.exportVaults(); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets isExporting back to false after export', () => {
    const { result } = renderHook(() => useVaultExport(sampleVaults));
    act(() => { result.current.exportVaults(); });
    expect(result.current.isExporting).toBe(false);
  });

  it('produced blob has JSON mime type', () => {
    const { result } = renderHook(() => useVaultExport(sampleVaults));
    act(() => { result.current.exportVaults(); });
    expect(capturedBlob?.type).toBe('application/json');
  });
});
