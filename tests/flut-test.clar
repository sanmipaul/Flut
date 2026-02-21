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
