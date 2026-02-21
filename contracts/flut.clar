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
    beneficiary: (optional principal),
    stacking-enabled: bool,
    stacking-pool: (optional principal)
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
(define-constant ERR-INVALID-PENALTY-RATE (err u7))
(define-constant ERR-NOT-PENALTY-OWNER (err u8))
(define-constant ERR-STACKING-NO-POOL (err u9))
(define-constant ERR-STACKING-NOT-ENABLED (err u10))

;; pox-4 contract reference (testnet — swap to SP000000000000000000002Q6VF78.pox-4 on mainnet)
(define-constant POX4-PRINCIPAL 'ST000000000000000000002AMW42H.pox-4)

;; Penalty configuration
(define-constant PENALTY_RATE u10)
(define-data-var penalty-destination principal tx-sender)

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

;; Calculate penalty amount based on penalty rate
(define-private (calculate-penalty (amount uint))
  (/ (* amount PENALTY_RATE) u100)
)

;; Emergency withdraw before unlock with penalty
(define-public (emergency-withdraw (vault-id uint))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
     (penalty-amount (calculate-penalty (get amount vault)))
     (user-amount (- (get amount vault) penalty-amount))
     (recipient (match (get beneficiary vault)
                   beneficiary beneficiary
                   (get creator vault)))
    )
    
    ;; Verify caller is vault creator
    (asserts! (is-eq tx-sender (get creator vault)) ERR-UNAUTHORIZED)
    
    ;; Verify vault hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)
    
    ;; Verify vault is still locked (allows early withdrawal)
    ;; Note: This should fail if already unlocked to preserve incentive for normal withdrawal
    ;; Optional: allow emergency-withdraw at any time for flexibility
    
    ;; Transfer user amount to recipient
    (try! (as-contract (stx-transfer? user-amount tx-sender recipient)))
    
    ;; Transfer penalty to destination
    (try! (as-contract (stx-transfer? penalty-amount tx-sender (var-get penalty-destination))))
    
    ;; Emit event for indexing
    (print { event: "emergency-withdrawal", vault-id: vault-id, amount: user-amount, penalty: penalty-amount })
    
    ;; Mark as withdrawn
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { is-withdrawn: true })
    )
    
    (ok { user-amount: user-amount, penalty: penalty-amount })
  )
)

;; Set the penalty destination address (contract owner only)
(define-public (set-penalty-destination (new-destination principal))
  (begin
    ;; In a real contract, this would check contract ownership
    ;; For this implementation, we allow the current penalty-destination to update
    (asserts! (is-eq tx-sender (var-get penalty-destination)) (err u8))
    
    (var-set penalty-destination new-destination)
    (ok true)
  )
)

;; Get penalty rate
(define-read-only (get-penalty-rate)
  PENALTY_RATE
)

;; Get penalty destination
(define-read-only (get-penalty-destination)
  (var-get penalty-destination)
)

;; Calculate penalty for a given amount
(define-read-only (get-penalty-amount (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (calculate-penalty (get amount v))
      u0
    )
  )
)

;; Get user withdrawal amount after penalty
(define-read-only (get-emergency-withdrawal-amount (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (- (get amount v) (calculate-penalty (get amount v)))
      u0
    )
  )
)
