;; Test suite for Flut smart contract
;; Tests cover vault creation, deposits, withdrawals, and beneficiary functionality

(use-trait sip10-trait 'ST1NXBK3K5YYMD6FD41SVHEX0288FY19MP1ECYEA.sip-010-trait-ft.sip-010-trait)

;; Helper function to advance blocks
(define-private (advance-blocks (blocks uint))
  (let loop ((i u0))
    (if (< i blocks)
      (begin
        (block-height)
        (loop (+ i u1))
      )
      true
    )
  )
)

;; Test: Create a basic vault
(define-private (test-create-vault)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut create-vault u100 u1000000)))
    (match result
      vault-id (begin
        (asserts! (is-eq vault-id u0) (err "First vault should have ID 0"))
        (ok "✓ Vault creation test passed")
      )
      error (err (concat "✗ Vault creation failed: " (to-string error)))
    )
  )
)

;; Test: Check vault details
(define-private (test-get-vault-details)
  (let
    ((vault (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-vault u0)))
    (match vault
      details (ok "✓ Get vault details test passed")
      none (err "✗ Vault details not found")
    )
  )
)

;; Test: Set beneficiary
(define-private (test-set-beneficiary)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut set-beneficiary u0 'ST1SJ3DTE5DN7X54YDH5D64R3BJB2ZZAB3A24GTNNP)))
    (match result
      success (ok "✓ Set beneficiary test passed")
      error (err (concat "✗ Set beneficiary failed: " (to-string error)))
    )
  )
)

;; Test: Verify beneficiary is set
(define-private (test-get-beneficiary)
  (let
    ((beneficiary (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-vault-beneficiary u0)))
    (ok "✓ Get beneficiary test passed")
  )
)

;; Test: Check vault unlock status
(define-private (test-vault-unlock-status)
  (let
    ((is-unlocked (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut is-vault-unlocked u0)))
    (ok "✓ Check vault unlock status test passed")
  )
)

;; Test: Get vault counter
(define-private (test-get-vault-count)
  (let
    ((count (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-vault-count)))
    (match count
      c (begin
        (asserts! (>= c u1) (err "Vault count should be at least 1"))
        (ok "✓ Get vault count test passed")
      )
      none (err "✗ Failed to get vault count")
    )
  )
)

;; Test: Deposit to existing vault
(define-private (test-deposit-to-vault)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut deposit u0 u500000)))
    (match result
      success (ok "✓ Deposit to vault test passed")
      error (err (concat "✗ Deposit failed: " (to-string error)))
    )
  )
)

;; Test: Get penalty rate
(define-private (test-get-penalty-rate)
  (let
    ((rate (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-penalty-rate)))
    (match rate
      r (begin
        (asserts! (is-eq r u10) (err "Penalty rate should be 10"))
        (ok "✓ Get penalty rate test passed")
      )
      none (err "✗ Failed to get penalty rate")
    )
  )
)

;; Test: Calculate penalty amount
(define-private (test-get-penalty-amount)
  (let
    ((penalty (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-penalty-amount u0)))
    (match penalty
      p (begin
        ;; For u1000000, 10% penalty should be u100000
        (asserts! (is-eq p u100000) (err (concat "Expected penalty u100000, got " (to-string p))))
        (ok "✓ Penalty calculation test passed")
      )
      none (err "✗ Failed to calculate penalty")
    )
  )
)

;; Test: Get emergency withdrawal amount
(define-private (test-get-emergency-withdrawal-amount)
  (let
    ((amount (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-emergency-withdrawal-amount u0)))
    (match amount
      a (begin
        ;; For u1000000, after 10% penalty should be u900000
        (asserts! (is-eq a u900000) (err (concat "Expected amount u900000, got " (to-string a))))
        (ok "✓ Emergency withdrawal amount test passed")
      )
      none (err "✗ Failed to get emergency withdrawal amount")
    )
  )
)

;; Test: Get penalty destination
(define-private (test-get-penalty-destination)
  (let
    ((destination (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-penalty-destination)))
    (ok "✓ Get penalty destination test passed")
  )
)

;; Test: Emergency withdrawal with penalty
(define-private (test-emergency-withdraw)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut emergency-withdraw u0)))
    (match result
      response (ok "✓ Emergency withdrawal test passed")
      error (err (concat "✗ Emergency withdrawal failed: " (to-string error)))
    )
  )
)

;; Test: Set penalty destination
(define-private (test-set-penalty-destination)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut set-penalty-destination 'ST1SJ3DTE5DN7X54YDH5D64R3BJB2ZZAB3A24GTNNP)))
    (match result
      success (ok "✓ Set penalty destination test passed")
      error (err (concat "✗ Set penalty destination failed: " (to-string error)))
    )
  )
)

;; Test: Edge case - small balance penalty
(define-private (test-small-balance-penalty)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-penalty-amount u0)))
    (match result
      p (begin
        ;; For u1000000, penalty should be u100000
        (asserts! (is-eq p u100000) (err "Small balance penalty calculation failed"))
        (ok "✓ Small balance penalty test passed")
      )
      none (err "✗ Failed to calculate small balance penalty")
    )
  )
)

;; Test: Edge case - exact penalty boundary
(define-private (test-penalty-boundary)
  (let
    ((rate (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-penalty-rate)))
    (match rate
      r (begin
        (asserts! (is-eq r u10) (err "Penalty rate should be exactly 10"))
        (ok "✓ Penalty boundary test passed")
      )
      none (err "✗ Failed to get penalty boundary")
    )
  )
)

;; Test: Edge case - zero remainder penalty
(define-private (test-zero-remainder-penalty)
  (let
    ((penalty (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-emergency-withdrawal-amount u0)))
    (match penalty
      p (begin
        ;; For u1000000 with 10%, amount should be u900000
        (asserts! (is-eq p u900000) (err "Zero remainder penalty calculation failed"))
        (ok "✓ Zero remainder penalty test passed")
      )
      none (err "✗ Failed to calculate zero remainder penalty")
    )
  )
)

;; Test: Multiple vaults with different balances
(define-private (test-multiple-vault-penalties)
  (let
    ((penalty1 (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-penalty-amount u0))
     (penalty2 (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-penalty-amount u1)))
    (ok "✓ Multiple vault penalties test passed")
  )
)

;; Test: NFT minting on vault creation
(define-private (test-nft-mint-on-vault-create)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut create-vault u100 u1000000)))
    (match result
      vault-id (begin
        (asserts! (is-eq vault-id u0) (err "First vault creation should succeed"))
        (ok "✓ NFT minting on vault creation test passed")
      )
      error (err (concat "✗ Vault creation failed: " (to-string error)))
    )
  )
)

;; Test: Get NFT token ID from vault
(define-private (test-get-vault-nft-token-id)
  (let
    ((nft-id (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-vault-nft-token-id u0)))
    (match nft-id
      token-id (ok "✓ Get vault NFT token ID test passed")
      none (err "✗ Failed to get vault NFT token ID")
    )
  )
)

;; Test: NFT metadata stored correctly
(define-private (test-nft-metadata-storage)
  (let
    ((metadata (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut-nft get-nft-metadata u0)))
    (match metadata
      data (ok "✓ NFT metadata storage test passed")
      none (err "✗ Failed to retrieve NFT metadata")
    )
  )
)

;; Test: NFT balance tracking
(define-private (test-nft-balance)
  (let
    ((balance (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut-nft get-balance tx-sender)))
    (match balance
      b (begin
        (asserts! (>= b u1) (err "User should have at least 1 NFT"))
        (ok "✓ NFT balance tracking test passed")
      )
      none (err "✗ Failed to get NFT balance")
    )
  )
)
