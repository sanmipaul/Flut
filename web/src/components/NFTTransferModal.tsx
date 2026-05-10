import React, { useState } from 'react';

interface NFTTransferModalProps {
  isOpen: boolean;
  tokenId: number;
  currentOwner: string;
  onTransfer: (tokenId: number, recipient: string) => Promise<void>;
  onCancel: () => void;
}

const NFTTransferModal: React.FC<NFTTransferModalProps> = ({
  isOpen,
  tokenId,
  currentOwner,
  onTransfer,
  onCancel,
}) => {
  const [recipient, setRecipient] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleTransfer = async () => {
    if (!recipient.trim()) {
      setError('Please enter a recipient address');
      return;
    }

    // Basic address validation
    if (!recipient.startsWith('SP') && !recipient.startsWith('ST')) {
      setError('Invalid recipient address. Must start with SP or ST');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onTransfer(tokenId, recipient);
      setRecipient('');
    } catch (err) {
      let message = err instanceof Error ? err.message : String(err);
      const codeMatch = message.match(/(\d+)/);
      if (codeMatch) {
        const code = parseInt(codeMatch[1], 10);
        try {
          const { formatError } = await import('../utils/VaultContractAPI');
          message = formatError(code);
        } catch {}
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="modal-overlay"
      role="presentation"
      onClick={onCancel}
    >
      <div 
        className="modal-content nft-transfer-modal"
        role="dialog"
        aria-labelledby="nft-modal-title"
        aria-describedby="nft-modal-description"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="nft-modal-title">Transfer NFT Receipt</h3>
          <button 
            className="modal-close focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded" 
            onClick={onCancel} 
            disabled={loading}
            aria-label="Close NFT transfer modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="info-section">
            <p id="nft-modal-description" className="modal-description">
              Transfer your vault NFT receipt to another address. The receipt represents ownership of the vault.
            </p>
          </div>

          <div className="transfer-details">
            <div className="detail-item">
              <label>NFT Token ID:</label>
              <code className="token-id" aria-label={`Token ID: ${tokenId}`}>{tokenId}</code>
            </div>

            <div className="detail-item">
              <label>Current Owner:</label>
              <code className="address" title={currentOwner}>
                {currentOwner.slice(0, 10)}...{currentOwner.slice(-8)}
              </code>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setError('');
              }}
              placeholder="SP... or ST..."
              disabled={loading}
              className="form-input focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'recipient-error' : 'recipient-hint'}
            />
            <small id="recipient-hint" className="input-hint">
              Enter a valid Stacks address starting with SP or ST
            </small>
          </div>

          {error && (
            <div id="recipient-error" className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="warning-section" role="note">
            <div className="warning-icon" aria-hidden="true">⚠️</div>
            <div className="warning-content">
              <strong>Important:</strong> Once transferred, the NFT receipt will belong to the new address. You will no longer be able to withdraw from the vault.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onCancel}
            disabled={loading}
            aria-label="Cancel NFT transfer"
          >
            Cancel
          </button>
          <button
            className="btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
            onClick={handleTransfer}
            disabled={loading || !recipient.trim()}
            aria-label={loading ? 'Transferring NFT' : 'Transfer NFT receipt to recipient'}
            aria-busy={loading}
          >
            {loading ? 'Transferring...' : 'Transfer NFT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTTransferModal;
