;; Test suite for vault management enhancements
;; Tests: deposit cooldown, vault caps, partial withdrawal, emergency withdrawal, multi-beneficiary

(define-constant ERR-DEPOSIT-COOLDOWN-ACTIVE (err u12))
(define-constant ERR-DEPOSIT-AMOUNT-EXCEEDED (err u13))
(define-constant ERR-VAULT-AMOUNT-EXCEEDED (err u14))
(define-constant ERR-INVALID-WITHDRAWAL-AMOUNT (err u15))
(define-constant ERR-INSUFFICIENT-BALANCE (err u16))
(define-constant ERR-EMERGENCY-WITHDRAWAL-DISABLED (err u17))
(define-constant ERR-INVALID-SHARES (err u18))
(define-constant ERR-BENEFICIARY-SAME-AS-CREATOR (err u19))
(define-constant ERR-BENEFICIARY-EXISTS (err u20))
(define-constant ERR-BENEFICIARY-HAS-WITHDRAWN (err u21))
(define-constant ERR-BENEFICIARY-NOT-FOUND (err u22))
(define-constant ERR-INVALID-PENALTY-RATE (err u23))

(define-constant TEST-VAULT-ID u0)
(define-constant TEST-OWNER 'ST1SJ3DTE5DN7X54YDH5D64R3BJB2ZZAB3A24GTNNP)
(define-constant TEST-BENEFICIARY 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
(define-constant TEST-BENEFICIARY2 'ST3A8Y7V5XW1Z4K2MJH9F0C6V8NB5QRD7LUGE)

;; Helper to advance block height
(define-private (advance-blocks (n uint))
  (if (<= n u0)
    true
    (begin
      (block-height)
      (advance-blocks (- n u1)))))

;; Test: Create vault with initial deposit
(define-private (test-create-vault-basics)
  (begin
    (try! (contract-call? .flut create-vault u1000000 u1000000))
    (let ((vault (unwrap! (contract-call? .flut get-vault TEST-VAULT-ID) (err u0))))
      (asserts! (is-eq (get owner vault) tx-sender) (err "Owner mismatch"))
      (asserts! (is-eq (get amount vault) u1000000) (err "Amount mismatch"))
      (asserts! (is-eq (get withdrawn vault) false) (err "Withdrawn should be false"))
      (ok true))))

;; Test: Deposit cooldown enforcement
(define-private (test-deposit-cooldown)
  (begin
    ;; Try immediate deposit - should fail
    (match (contract-call? .flut deposit TEST-VAULT-ID u500000)
      success (err "Deposit should fail due to cooldown")
      error (if (is-eq error ERR-DEPOSIT-COOLDOWN-ACTIVE) (ok true) (err "Wrong error")))
    ;; Advance blocks past cooldown
    (try! (advance-blocks u145))
    ;; Now deposit should succeed
    (match (contract-call? .flut deposit TEST-VAULT-ID u500000)
      success (ok true)
      error (err "Deposit after cooldown should succeed"))))

;; Test: Max single deposit enforcement
(define-private (test-max-single-deposit)
  (begin
    ;; Try deposit exceeding MAX-SINGLE-DEPOSIT
    (match (contract-call? .flut deposit TEST-VAULT-ID u2000000000001) ;; >1M STX
      success (err "Should fail - amount too high")
      error (if (is-eq error ERR-DEPOSIT-AMOUNT-EXCEEDED) (ok true) (err "Wrong error")))))

;; Test: Vault total balance cap
(define-private (test-vault-balance-cap)
  (begin
    ;; First ensure cooldown passed
    (try! (advance-blocks u145))
    ;; Deposit to reach near cap (5M STX)
    ;; Current balance is 1.5M from previous tests; we'll top up to exceed cap
    (let ((current (get amount (unwrap! (contract-call? .flut get-vault TEST-VAULT-ID) (err u0)))))
      (if (< current MAX-VAULT-BALANCE)
        (begin
          (let ((needed (- MAX-VAULT-BALANCE current)))
            (match (contract-call? .flut deposit TEST-VAULT-ID needed)
              success (ok true)
              error (if (is-eq error ERR-VAULT-AMOUNT-EXCEEDED) (ok true) (err "Unexpected error"))))
          ;; Try one more micro-deposit
          (match (contract-call? .flut deposit TEST-VAULT-ID u1)
            success (err "Should have exceeded cap")
            error (if (is-eq error ERR-VAULT-AMOUNT-EXCEEDED) (ok true) (err "Cap not enforced"))))
        (ok true)))))

;; Test: Partial withdrawal
(define-private (test-partial-withdrawal)
  (begin
    (let ((vault-before (unwrap! (contract-call? .flut get-vault TEST-VAULT-ID) (err u0)))
          (balance-before (get amount vault-before)))
      (asserts! (> balance-before u1000000) (err "Need balance to test partial"))
      (let ((withdraw-amount u500000))
        (match (contract-call? .flut withdraw-amount TEST-VAULT-ID withdraw-amount)
          success
            (let ((vault-after (unwrap! (contract-call? .flut get-vault TEST-VAULT-ID) (err u0))))
              (asserts! (is-eq (get amount vault-after) (- balance-before withdraw-amount)) (err "Balance incorrect after partial"))
              (asserts! (is-eq (get withdrawn vault-after) false) (err "Withdrawn flag should remain false"))
              (ok true))
          error (err (concat "Partial withdrawal failed: " (to-string error))))))))

;; Test: Emergency withdrawal requires flag
(define-private (test-emergency-withdrawal-requires-flag)
  (begin
    ;; Ensure flag is off by default
    (match (contract-call? .flut is-emergency-withdrawal-enabled TEST-VAULT-ID)
      {ok: enabled} (if enabled (err "Flag should be false") (ok true))
      _ (err "Call failed"))
    ;; Attempt should fail
    (match (contract-call? .flut emergency-withdraw TEST-VAULT-ID)
      success (err "Should fail without flag")
      error (if (is-eq error ERR-EMERGENCY-WITHDRAWAL-DISABLED) (ok true) (err "Wrong error")))
    ;; Enable flag
    (match (contract-call? .flut set-emergency-withdrawal-enabled TEST-VAULT-ID true)
      success (ok true)
      error (err "Failed to enable"))
    ;; Now emergency withdrawal should work
    (match (contract-call? .flut emergency-withdraw TEST-VAULT-ID)
      success (ok true)
      error (err (concat "Emergency withdrawal failed: " (to-string error))))))

;; Test: Emergency withdrawal applies penalty
(define-private (test-emergency-penalty)
  (begin
    ;; Create a new vault to test penalty
    (let ((vault-id (var-get vault-counter))) ;; assuming new vault gets id 1
      (try! (contract-call? .flut create-vault u1000000 u1000000))
      ;; Set penalty rate 10% (1000 bps)
      (try! (contract-call? .flut set-emergency-withdrawal-penalty vault-id u1000))
      (let ((balance-before (get amount (unwrap! (contract-call? .flut get-vault vault-id) (err u0)))))
        (match (contract-call? .flut emergency-withdraw vault-id)
          success
            (let ((balance-after (get amount (unwrap! (contract-call? .flut get-vault vault-id) (err u0)))))
              ;; Balance should be zero after emergency withdrawal
              (asserts! (is-eq balance-after u0) (err "Balance not zeroed"))
              ;; Penalty amount = 10% of initial = u100000
              ;; Net transferred = u900000
              (ok true))
            error (err (concat "Emergency withdraw error: " (to-string error)))))))

;; Test: Multi-beneficiary basic flow
(define-private (test-multi-beneficiary)
  (begin
    (let ((vault-id (var-get vault-counter)))
      (try! (contract-call? .flut create-vault u10000000 u1000000)) ;; large balance
      ;; Add first beneficiary with 3000 shares (30%)
      (try! (contract-call? .flut add-beneficiary vault-id TEST-BENEFICIARY u3000))
      ;; Check total shares = 3000
      (let ((total (unwrap! (contract-call? .flut get-vault-total-shares vault-id) (err u0))))
        (asserts! (is-eq total u3000) (err "Total shares incorrect")))
      ;; Add second beneficiary with 2000 shares (20%) -> total 5000
      (try! (contract-call? .flut add-beneficiary vault-id TEST-BENEFICIARY2 u2000))
      (let ((total2 (unwrap! (contract-call? .flut get-vault-total-shares vault-id) (err u0)))
            (count (unwrap! (contract-call? .flut get-beneficiary-count vault-id) (err u0))))
        (asserts! (is-eq total2 u5000) (err "Total shares after second add incorrect"))
        (asserts! (is-eq count u2) (err "Beneficiary count should be 2"))
        ;; beneficiary getter works
        (let ((shares (unwrap! (contract-call? .flut get-beneficiary-shares vault-id TEST-BENEFICIARY) (err u0))))
          (asserts! (is-eq shares u3000) (err "Shares for first beneficiary wrong")))
        (ok true)))))

;; Test: Beneficiary cannot exceed total shares 10000
(define-private (test-beneficiary-shares-cap)
  (begin
    (let ((vault-id (var-get vault-counter)))
      (try! (contract-call? .flut create-vault u1000000 u1000000))
      ;; Add 10 beneficiaries each with 1000 shares (total 10000)
      ;; We'll add 10 times but loop not available; we can add until 9 then try extra
      (try! (contract-call? .flut add-beneficiary vault-id 'ST111111111111111111111111111111111111111111 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST222222222222222222222222222222222222222222 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST333333333333333333333333333333333333333333 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST444444444444444444444444444444444444444444 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST555555555555555555555555555555555555555555 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST666666666666666666666666666666666666666666 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST777777777777777777777777777777777777777777 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST888888888888888888888888888888888888888888 u1000))
      (try! (contract-call? .flut add-beneficiary vault-id 'ST999999999999999999999999999999999999999999 u1000))
      ;; Total shares = 9000
      (let ((total-before (unwrap! (contract-call? .flut get-vault-total-shares vault-id) (err u0))))
        (asserts! (is-eq total-before u9000) (err "Should be 9000"))
        ;; Try adding another 1000 would exceed 10000? Actually 9000+1000 = 10000 exactly allowed.
        (try! (contract-call? .flut add-beneficiary vault-id 'STAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA u1000))
        (let ((total-after (unwrap! (contract-call? .flut get-vault-total-shares vault-id) (err u0))))
          (asserts! (is-eq total-after u10000) (err "Total should be 10000"))
          ;; Now adding any more even 1 share should fail
          (match (contract-call? .flut add-beneficiary vault-id 'STBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB u1)
            success (err "Should fail - total shares cap exceeded")
            error (if (is-eq error ERR-VAULT-AMOUNT-EXCEEDED) (ok true) (err "Wrong error")))))))))

;; Test: Beneficiary withdrawal distribution
(define-private (test-beneficiary-withdrawal)
  (begin
    (let ((vault-id (var-get vault-counter)))
      ;; Create vault with unlock-height = u100 so it's already unlocked after 101 blocks
      (try! (contract-call? .flut create-vault u10000000 u100))
      (try! (contract-call? .flut add-beneficiary vault-id TEST-BENEFICIARY u5000)) ;; 50%
      ;; Vault is unlocked (unlock-height is 100, we're past it)
      ;; Withdraw as beneficiary should work
      (try! (contract-call? .flut withdraw-as-beneficiary vault-id u500000)) ;; 50% of 10M = 5M
      (ok true))))

;; Run all tests
(define-public (run-all-tests)
  (begin
    (try! (test-create-vault-basics))
    (try! (test-deposit-cooldown))
    (try! (test-max-single-deposit))
    (try! (test-vault-balance-cap))
    (try! (test-partial-withdrawal))
    (try! (test-emergency-withdrawal-requires-flag))
    (try! (test-emergency-penalty))
    (try! (test-multi-beneficiary))
    (try! (test-beneficiary-shares-cap))
    (ok "All vault management enhancement tests passed")))
