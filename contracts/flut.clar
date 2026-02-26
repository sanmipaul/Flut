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
    beneficiaries: (list 10 principal),
    stacking-enabled: bool,
    stacking-pool: (optional principal)
  }
)

;; Beneficiary record for multi-beneficiary support
(define-map vault-beneficiaries
  { vault-id: uint, address: principal }
  { share: uint } ;; share in basis points (100 = 1%)
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
(define-constant ERR-INVALID-SHARES (err u11))
(define-constant ERR-TOO-MANY-BENEFICIARIES (err u12))
(define-constant ERR-BENEFICIARY-EXISTS (err u13))
;; Beneficiary validation errors
(define-constant ERR-INVALID-BENEFICIARY (err u14))        ;; Beneficiary address is invalid
(define-constant ERR-BENEFICIARY-SAME-AS-CREATOR (err u15)) ;; Cannot set creator as beneficiary

;; Basis points for share calculations (10000 = 100%)
(define-constant BASIS_POINTS u10000)

;; pox-4 contract reference (testnet — swap to SP000000000000000000002Q6VF78.pox-4 on mainnet)
(define-constant POX4-PRINCIPAL 'ST000000000000000000002AMW42H.pox-4)

;; Penalty configuration
(define-constant PENALTY_RATE u10)
(define-data-var penalty-destination principal tx-sender)

;; Private: validate beneficiary address
;; Ensures beneficiary is a valid address and not the contract itself
;; 
;; This helper function performs core validation checks:
;; 1. Ensures beneficiary is not the contract address
;; 2. Ensures beneficiary is not the null address
;;
;; @param beneficiary - Principal address to validate
;; @return true if valid, false otherwise
(define-private (is-valid-beneficiary (beneficiary principal))
  (and
    (not (is-eq beneficiary (as-contract tx-sender)))
    (not (is-eq beneficiary 'ST000000000000000000000000000000000000000000000000000000000000))
  )
)

;; Private: attempt to delegate vault STX to a stacking pool via pox-4.
;; Returns true on success, false on any delegation error (graceful fallback —
;; a delegation failure must never block vault creation or deposit).
(define-private (try-delegate-stacking (amount uint) (pool principal))
  (match (as-contract (contract-call? 'ST000000000000000000002AMW42H.pox-4 delegate-stx amount pool none none))
    _success (begin
      (print { event: "stacking-delegated", amount: amount, pool: pool })
      true
    )
    _err (begin
      (print { event: "stacking-delegation-failed", pool: pool })
      false
    )
  )
)

;; Private: get the withdrawal recipient for a vault
;; Returns beneficiary if set and valid, otherwise returns vault creator
(define-private (get-withdrawal-recipient (vault principal))
  (match (get beneficiary vault)
    beneficiary-opt 
      (if (is-valid-beneficiary beneficiary-opt)
        beneficiary-opt
        (get creator vault)
      )
    (get creator vault)
  )
)

;; Private: validate withdrawal recipient before processing
;; Returns true on success, false if there was no active delegation or any error.
;; Graceful — a failed revocation must never block withdrawal.
(define-private (try-revoke-stacking)
  (match (as-contract (contract-call? 'ST000000000000000000002AMW42H.pox-4 revoke-delegate-stx))
    _success (begin
      (print { event: "stacking-revoked" })
      true
    )
    _err (begin
      (print { event: "stacking-revoke-failed" })
      false
    )
  )
)

;; Create a new vault.
;; enable-stacking: opt-in to PoX delegation while funds are locked.
;; stacking-pool: pool principal to delegate to (required when enable-stacking is true).
(define-public (create-vault (lock-duration uint) (initial-amount uint) (enable-stacking bool) (stacking-pool (optional principal)))
  (let
    ((vault-id (var-get vault-counter))
     (unlock-height (+ lock-duration block-height)))

    ;; Validate inputs
    (asserts! (> initial-amount u0) ERR-INVALID-AMOUNT)
    (asserts! (> lock-duration u0) ERR-INVALID-HEIGHT)

    ;; A pool address is mandatory when stacking opt-in is requested
    (if enable-stacking
      (asserts! (is-some stacking-pool) ERR-STACKING-NO-POOL)
      true
    )

    ;; Transfer STX to contract
    (try! (stx-transfer? initial-amount tx-sender (as-contract tx-sender)))

    ;; Attempt stacking delegation — graceful fallback on failure
    (if (and enable-stacking (is-some stacking-pool))
      (try-delegate-stacking initial-amount (unwrap-panic stacking-pool))
      false
    )

    ;; Create vault record
    (map-set vaults
      { vault-id: vault-id }
      {
        creator: tx-sender,
        amount: initial-amount,
        unlock-height: unlock-height,
        created-at: block-height,
        is-withdrawn: false,
        beneficiaries: (list),
        stacking-enabled: enable-stacking,
        stacking-pool: stacking-pool
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
     (recipient (get-withdrawal-recipient vault))
    )
    
    ;; Verify caller is vault creator
    (asserts! (is-eq tx-sender (get creator vault)) ERR-UNAUTHORIZED)
    
    ;; Verify vault is unlocked
    (asserts! (>= block-height (get unlock-height vault)) ERR-NOT-UNLOCKED)
    
    ;; Verify hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)

    ;; Revoke stacking delegation before transferring funds out
    (if (get stacking-enabled vault)
      (try-revoke-stacking)
      false
    )

    ;; Transfer funds to recipient (beneficiary or creator)
    (try! (as-contract (stx-transfer? (get amount vault) tx-sender recipient)))
    
    ;; Mark as withdrawn
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { is-withdrawn: true })
    )
    
    ;; Emit withdrawal event
    (print { event: "vault-withdrawn", vault-id: vault-id, recipient: recipient, amount: (get amount vault) })
    
    (ok true)
  )
)

;; Set beneficiary for a vault (only owner can call)
;; 
;; This function allows the vault creator to designate a beneficiary address
;; that will receive the vault funds upon withdrawal instead of the creator.
;;
;; @param vault-id - ID of the vault to update
;; @param beneficiary - Principal address to receive vault funds on withdrawal
;;
;; @return (ok true) on successful beneficiary set, or error code:
;;   - ERR-VAULT-NOT-FOUND: Vault with given ID does not exist
;;   - ERR-UNAUTHORIZED: Caller is not the vault creator
;;   - ERR-ALREADY-WITHDRAWN: Vault has already been withdrawn
;;   - ERR-INVALID-BENEFICIARY: Beneficiary address is invalid (e.g., contract itself)
;;   - ERR-BENEFICIARY-SAME-AS-CREATOR: Beneficiary cannot be the vault creator
;;
;; Events emitted:
;;   - beneficiary-set: Logs vault-id, new beneficiary, and caller
(define-public (set-beneficiary (vault-id uint) (beneficiary principal))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    
    ;; Verify caller is vault creator
    (asserts! (is-eq tx-sender (get creator vault)) ERR-UNAUTHORIZED)
    
    ;; Verify vault hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)
    
    ;; Validate beneficiary address
    (asserts! (is-valid-beneficiary beneficiary) ERR-INVALID-BENEFICIARY)
    
    ;; Prevent setting creator as beneficiary
    (asserts! (not (is-eq beneficiary (get creator vault))) ERR-BENEFICIARY-SAME-AS-CREATOR)
    
    ;; Set beneficiary
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { beneficiary: (some beneficiary) })
    )
    
    ;; Emit event for beneficiary change
    (print { event: "beneficiary-set", vault-id: vault-id, beneficiary: beneficiary, changed-by: tx-sender })
    
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

;; Check if beneficiary can be modified for a vault
;; Returns true if vault exists, is active (not withdrawn), and can be modified
(define-read-only (can-modify-beneficiary (vault-id uint) (caller principal))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (and
          (is-eq caller (get creator v))
          (not (get is-withdrawn v))
        )
      false
    )
  )
)

;; Deposit additional funds into an existing vault.
;; When stacking is enabled the delegation is revoked and reissued with the
;; updated total so the pool always delegates the correct amount.
(define-public (deposit (vault-id uint) (amount uint))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
     (new-total (+ (get amount vault) amount)))

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
      (merge vault { amount: new-total })
    )

    ;; Re-delegate with the updated total when stacking is active
    (if (and (get stacking-enabled vault) (is-some (get stacking-pool vault)))
      (let ((pool (unwrap-panic (get stacking-pool vault))))
        (try-revoke-stacking)
        (try-delegate-stacking new-total pool)
      )
      false
    )

    (ok true)
  )
)

;; Check whether stacking is enabled for a vault
(define-read-only (is-stacking-enabled (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (get stacking-enabled v)
      false
    )
  )
)

;; Get stacking configuration for a vault
(define-read-only (get-stacking-info (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (some {
          enabled: (get stacking-enabled v),
          pool: (get stacking-pool v),
          amount: (get amount v),
          unlock-height: (get unlock-height v)
        })
      none
    )
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

    ;; Revoke stacking delegation before transferring funds out
    (if (get stacking-enabled vault)
      (try-revoke-stacking)
      false
    )

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

;; Allow vault owner to change the stacking pool (revokes old delegation and re-delegates).
;; Can also be used to enable stacking on an existing non-stacking vault.
(define-public (update-stacking-pool (vault-id uint) (new-pool principal))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))

    ;; Only vault creator may update the pool
    (asserts! (is-eq tx-sender (get creator vault)) ERR-UNAUTHORIZED)

    ;; Vault must still be active
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)

    ;; Revoke any existing delegation before switching pools
    (if (get stacking-enabled vault)
      (try-revoke-stacking)
      false
    )

    ;; Update stacking fields on the vault
    (map-set vaults
      { vault-id: vault-id }
      (merge vault {
        stacking-enabled: true,
        stacking-pool: (some new-pool)
      })
    )

    ;; Delegate to the new pool
    (try-delegate-stacking (get amount vault) new-pool)

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

;; Private helper: sum total shares for a vault
(define-private (sum-vault-shares (vault-id uint) (beneficiaries (list 10 principal)))
  (fold + (map (lambda (beneficiary) 
                 (default-to u0 (get share (map-get? vault-beneficiaries { vault-id: vault-id, address: beneficiary }))))
               beneficiaries) u0)
)

;; Private helper: calculate amount for a given share
(define-private (calculate-share-amount (total-amount uint) (share uint))
  (/ (* total-amount share) BASIS_POINTS)
)
