;; Flut — STX Savings Vault
;; A non-custodial, time-locked savings protocol built on Stacks

;; Vault data structure
(define-map vaults
  { vault-id: uint }
  {
    creator: principal,
    amount: uint,
    unlock-height: uint,
    created-at: uint,
    is-withdrawn: bool,
    beneficiary: (optional principal)
  }
)

;; Track the total number of vaults
(define-data-var vault-counter uint u0)

;; Track vault IDs for each principal
(define-map user-vaults
  { user: principal }
  { vault-ids: (list 100 uint) }
)

;; Error codes
(define-constant ERR-VAULT-NOT-FOUND (err u1))
(define-constant ERR-UNAUTHORIZED (err u2))
(define-constant ERR-NOT-UNLOCKED (err u3))
(define-constant ERR-ALREADY-WITHDRAWN (err u4))
(define-constant ERR-INVALID-AMOUNT (err u5))
(define-constant ERR-INVALID-HEIGHT (err u6))

;; Create a new vault
(define-public (create-vault (lock-duration uint) (initial-amount uint))
  (let
    ((vault-id (var-get vault-counter))
     (unlock-height (+ lock-duration block-height)))
    
    ;; Validate inputs
    (asserts! (> initial-amount u0) ERR-INVALID-AMOUNT)
    (asserts! (> lock-duration u0) ERR-INVALID-HEIGHT)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? initial-amount tx-sender (as-contract tx-sender)))
    
    ;; Create vault
    (map-set vaults
      { vault-id: vault-id }
      {
        creator: tx-sender,
        amount: initial-amount,
        unlock-height: unlock-height,
        created-at: block-height,
        is-withdrawn: false,
        beneficiary: none
      }
    )
    
    ;; Increment counter
    (var-set vault-counter (+ vault-id u1))
    
    (ok vault-id)
  )
)

;; Withdraw from a vault
(define-public (withdraw (vault-id uint))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
     (recipient (match (get beneficiary vault) 
                   beneficiary beneficiary
                   (get creator vault)))
    )
    
    ;; Verify caller is vault creator
    (asserts! (is-eq tx-sender (get creator vault)) ERR-UNAUTHORIZED)
    
    ;; Verify vault is unlocked
    (asserts! (>= block-height (get unlock-height vault)) ERR-NOT-UNLOCKED)
    
    ;; Verify hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)
    
    ;; Transfer funds to recipient (beneficiary or creator)
    (try! (as-contract (stx-transfer? (get amount vault) tx-sender recipient)))
    
    ;; Mark as withdrawn
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { is-withdrawn: true })
    )
    
    (ok true)
  )
)

;; Set beneficiary for a vault (only owner can call)
(define-public (set-beneficiary (vault-id uint) (beneficiary principal))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    
    ;; Verify caller is vault creator
    (asserts! (is-eq tx-sender (get creator vault)) ERR-UNAUTHORIZED)
    
    ;; Verify vault hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)
    
    ;; Set beneficiary
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { beneficiary: (some beneficiary) })
    )
    
    (ok true)
  )
)

;; Get vault details
(define-read-only (get-vault (vault-id uint))
  (map-get? vaults { vault-id: vault-id })
)

;; Get total vault count
(define-read-only (get-vault-count)
  (var-get vault-counter)
)

;; Check if vault is unlocked
(define-read-only (is-vault-unlocked (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (>= block-height (get unlock-height v))
      false
    )
  )
)

;; Get vault beneficiary
(define-read-only (get-vault-beneficiary (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (get beneficiary v)
      none
    )
  )
)

;; Deposit additional funds into an existing vault
(define-public (deposit (vault-id uint) (amount uint))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    
    ;; Verify caller is vault creator
    (asserts! (is-eq tx-sender (get creator vault)) ERR-UNAUTHORIZED)
    
    ;; Verify amount is positive
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Verify vault hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update vault amount
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { amount: (+ (get amount vault) amount) })
    )
    
    (ok true)
  )
)
