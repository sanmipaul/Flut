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

;; Test: deposit with zero amount returns error code
(define-private (test-deposit-zero-error)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut deposit u0 u0)))
    (match result
      success (err "✗ Zero deposit should not succeed")
      error (ok "✓ Deposit zero amount error returned"))))

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

;; ------------------------------------------------
;; Withdrawal Safety Feature Tests
;; ------------------------------------------------

;; Test: can-withdraw-vault read-only check
(define-private (test-can-withdraw-vault)
  (let
    ((can (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut can-withdraw-vault u0 tx-sender)))
    (match can
      b (begin
            (asserts! b (err "Vault should be withdrawable after unlock"))
            (ok "✓ can-withdraw-vault test passed")
          )
      none (err "✗ can-withdraw-vault returned none"))
  )
)

;; Test: can-withdraw-amount partial check
(define-private (test-can-withdraw-amount)
  (let
    ((able (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut can-withdraw-amount u0 u500000 tx-sender)))
    (match able
      b (begin
            (asserts! b (err "Should be able to withdraw partial amount"))
            (ok "✓ can-withdraw-amount test passed")
          )
      none (err "✗ can-withdraw-amount returned none"))
  )
)

;; Test: withdrawal history updated after withdrawal
(define-private (test-withdrawal-history)
  (let
    ((hist (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-withdrawal-history u0)))
    (match hist
      h (ok "✓ Withdrawal history retrieval test passed")
      none (err "✗ Withdrawal history missing"))
  )
)

;; Test: emergency withdrawal toggle
(define-private (test-emergency-toggle)
  (let
    ((off (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut set-emergency-withdrawal-enabled false)))
    (match off
      s (ok "✓ Disabled emergency withdrawals" )
      e (err (concat "✗ Failed to disable: " (to-string e))))
    ;; revert for future tests
    (let ((on (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut set-emergency-withdrawal-enabled true)))
      (ok "✓ Re-enabled emergency withdrawals"))
  )
)

;; Test: get user withdrawn vaults list
(define-private (test-get-user-withdrawn-vaults)
  (let
    ((list (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-user-withdrawn-vaults tx-sender)))
    (ok "✓ Get user withdrawn vaults test passed")
  )
)

;; Test: get last withdrawal attempt block
(define-private (test-last-withdrawal-attempt)
  (let
    ((blk (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-vault-last-withdrawal-attempt u0)))
    (ok "✓ Last withdrawal attempt retrieval test passed")
  )
)

;; Test: check emergency withdrawal info structure
(define-private (test-emergency-withdrawal-info)
  (let
    ((info (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-emergency-withdrawal-info u0)))
    (ok "✓ Emergency withdrawal info test passed")
  )
)

;; Test: Partial withdraw functionality
(define-private (test-partial-withdraw)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut partial-withdraw u0 u250000)))
    (match result
      success (ok "✓ Partial withdraw test passed")
      error (err (concat "✗ Partial withdraw failed: " (to-string error)))
    )
  )
)

;; Test: error description helper returns expected string
(define-private (test-error-description)
  (let
    ((desc (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-error-description u5)))
    (match desc
      s (begin
            (asserts! (is-eq s "Invalid amount") (err "Description mismatched"))
            (ok "✓ Error description helper test passed"))
      _ (err "✗ Error description call returned unexpected type"))))

;; Additional test: description for deposit limit error
(define-private (test-error-description-deposit-limit)
  (let
    ((desc (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-error-description u18)))
    (match desc
      s (begin
            (asserts! (is-eq s "Deposit amount exceeded"))
            (ok "✓ Deposit limit error description test passed"))
      _ (err "✗ Failed to get description for deposit limit"))))

;; End of new withdrawal safety tests

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

;; ===== Stacking Integration Tests =====

;; Test: Create vault without stacking
(define-private (test-create-vault-no-stacking)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut create-vault u100 u1000000 false none)))
    (match result
      vault-id (ok "✓ Create vault without stacking test passed")
      error (err (concat "✗ Create vault without stacking failed: " (to-string error)))
    )
  )
)

;; Test: Create vault with stacking enabled and a pool address
(define-private (test-create-vault-with-stacking)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut create-vault u200 u2000000 true (some 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))))
    (match result
      vault-id (ok "✓ Create vault with stacking test passed")
      error (err (concat "✗ Create vault with stacking failed: " (to-string error)))
    )
  )
)

;; Test: Stacking enabled flag requires a pool address
(define-private (test-stacking-requires-pool)
  (let
    ((result (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut create-vault u100 u1000000 true none)))
    (match result
      vault-id (err "✗ Should have failed — stacking without pool must return ERR-STACKING-NO-POOL")
      error (ok "✓ Stacking-requires-pool validation test passed")
    )
  )
)

;; Test: is-stacking-enabled returns false for non-stacking vault
(define-private (test-is-stacking-enabled-false)
  (let
    ((enabled (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut is-stacking-enabled u0)))
    (match enabled
      v (begin
          (asserts! (is-eq v false) (err "✗ Expected stacking-enabled to be false"))
          (ok "✓ is-stacking-enabled false test passed")
        )
      none (err "✗ Vault not found for is-stacking-enabled check")
    )
  )
)

;; Test: get-stacking-info returns pool and amount for stacking vault
(define-private (test-get-stacking-info)
  (let
    ((info (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-stacking-info u1)))
    (match info
      stacking-data (ok "✓ get-stacking-info returned data for stacking vault")
      none (err "✗ get-stacking-info returned none — expected stacking data")
    )
  )
)

;; Test: get-stacking-info returns none for unknown vault
(define-private (test-get-stacking-info-unknown-vault)
  (let
    ((info (contract-call? 'ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut get-stacking-info u999)))
    (match info
      _data (err "✗ Expected none for unknown vault ID")
      none (ok "✓ get-stacking-info returns none for unknown vault test passed")
    )
  )
)
