import React, { useState } from 'react';
import NFTTransferModal from './NFTTransferModal';

interface NFTBadgeProps {
  tokenId: number;
  vaultId: number;
  currentOwner?: string;
  onTransfer?: (tokenId: number, recipient: string) => Promise<void>;
  explorerUrl?: string;
}

export const NFTBadge: React.FC<NFTBadgeProps> = ({
  tokenId,
  vaultId,
  currentOwner = 'STX_HOLDER',
  onTransfer,
  explorerUrl = 'https://explorer.hiro.so',
}) => {
  const [showTransferModal, setShowTransferModal] = useState(false);

  const nftExplorerUrl = `${explorerUrl}/nft?address=ST1VAULT_NFT_ADDRESS.flut-nft&token=vault-receipt&id=${tokenId}`;

  const handleTransfer = async (newRecipient: string) => {
    if (onTransfer) {
      try {
        await onTransfer(tokenId, newRecipient);
        setShowTransferModal(false);
      } catch (error) {
        console.error('Transfer failed:', error);
        throw error;
      }
    }
  };

  return (
    <>
      <div className="nft-badge">
        <div className="nft-badge-header">
          <span className="nft-icon">🎖️</span>
          <h3>Vault NFT Receipt</h3>
        </div>
        
        <div className="nft-badge-content">
          <p className="nft-description">
            Your savings commitment is secured and verified on-chain
          </p>

          <div className="nft-details">
            <div className="nft-detail-item">
              <label>Token ID:</label>
              <code>{tokenId}</code>
            </div>

            <div className="nft-detail-item">
              <label>Vault ID:</label>
              <code>{vaultId}</code>
            </div>

            <div className="nft-detail-item">
              <label>Contract:</label>
              <code>flut-nft</code>
            </div>
          </div>

          <div className="nft-actions">
            <a
              href={nftExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary nft-button"
            >
              View on Explorer
            </a>

            {onTransfer && (
              <button
                className="btn-secondary nft-button"
                onClick={() => setShowTransferModal(true)}
              >
                Transfer NFT
              </button>
            )}

            <a
              href={`https://twitter.com/intent/tweet?text=I%27m%20saving%20STX%20with%20Flut!%20My%20vault%20%23${vaultId}%20is%20locked%20until%20a%20future%20date.%20Join%20the%20movement%20to%20enforce%20savings%20discipline%20on%20Stacks.%20%23STX%20%23DeFi`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary nft-button"
            >
              Share on Twitter
            </a>
          </div>

          <div className="nft-info">
            <h4>What is a Vault NFT?</h4>
            <ul>
              <li>Proof of your savings commitment on-chain</li>
              <li>Transferable to other wallets</li>
              <li>Opens DeFi composability opportunities</li>
              <li>Burns on vault redemption</li>
              <li>Creates social signal for savings discipline</li>
            </ul>
          </div>
        </div>
      </div>

      {onTransfer && (
        <NFTTransferModal
          isOpen={showTransferModal}
          tokenId={tokenId}
          currentOwner={currentOwner}
          onTransfer={handleTransfer}
          onCancel={() => setShowTransferModal(false)}
        />
      )}
    </>
  );
};

export default NFTBadge;
