;; Flut — STX Savings Vault
;; A non-custodial, time-locked savings protocol built on Stacks

;; ============================================
;; Data Structures
;; ============================================
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

;; Track last deposit block for each vault (rate limiting)
(define-map vault-last-deposit-block
  { vault-id: uint }
  { block-height: uint }
)

;; Track vault creation time for rate limiting
(define-map vault-creation-time
  { vault-id: uint }
  { created-at: uint }
)

;; Track withdrawal history and metadata
(define-map withdrawal-history
  { vault-id: uint }
  {
    withdrawal-time: uint,
    withdrawal-block: uint,
    amount-withdrawn: uint,
    recipient: principal,
    was-emergency: bool
  }
)

;; Track last withdrawal attempt for security auditing
(define-map withdrawal-attempts
  { vault-id: uint }
  { last-attempt-block: uint }
)

;; Config flag to enable/disable emergency withdrawals globally
(define-data-var emergency-withdrawal-enabled bool true)


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

;; Operation limit errors
(define-constant ERR-TOO-MANY-VAULTS (err u16))             ;; User has reached max vault limit
(define-constant ERR-DEPOSIT-COOLDOWN-ACTIVE (err u17))     ;; Must wait before next deposit
(define-constant ERR-DEPOSIT-AMOUNT-EXCEEDED (err u18))     ;; Single deposit amount too large
(define-constant ERR-VAULT-AMOUNT-EXCEEDED (err u19))       ;; Total vault amount exceeds limit

;; Withdrawal safety errors
(define-constant ERR-INSUFFICIENT-BALANCE (err u20))        ;; Vault balance less than withdrawal
(define-constant ERR-INVALID-WITHDRAWAL-AMOUNT (err u21))   ;; Withdrawal amount is zero or invalid
(define-constant ERR-RECIPIENT-CANNOT-WITHDRAW (err u22))   ;; Recipient cannot withdraw before unlock
(define-constant ERR-WITHDRAWAL-NOT-ALLOWED (err u23))      ;; Withdrawal not allowed for this vault
(define-constant ERR-EMERGENCY-WITHDRAWAL-DISABLED (err u24)) ;; Emergency withdrawal disabled

;; ============================================
;; Constants
;; ============================================

;; Basis points for share calculations (10000 = 100%)
(define-constant BASIS_POINTS u10000)

;; pox-4 contract reference (testnet — swap to SP000000000000000000002Q6VF78.pox-4 on mainnet)
(define-constant POX4-PRINCIPAL 'ST000000000000000000002AMW42H.pox-4)

;; Penalty configuration
(define-constant PENALTY_RATE u10)

;; ============================================
;; Operation Limits and Rate Limiting
;; ============================================
;;
;; This section implements vault operation limits and rate limiting to:
;; 1. Prevent abuse and spam (vault creation and deposit flooding)
;; 2. Establish fair usage patterns across all users
;; 3. Protect contract stability and performance
;;
;; Key Limits:
;; - MAX_VAULTS_PER_USER (10): Maximum vaults per user prevents per-user DOS
;; - MIN_BLOCKS_BETWEEN_DEPOSITS (1): Rate limiting on deposits prevents deposit spam
;; - MAX_DEPOSIT_AMOUNT (1000 STX): Single deposit cap prevents transaction bloat
;; - MAX_VAULT_TOTAL_AMOUNT (10000 STX): Total vault cap prevents economic concentration
;;
;; Rate Limiting Implementation:
;; - Tracks last deposit block per vault in vault-last-deposit-block map
;; - Enforces minimum block gap between consecutive deposits
;; - Frontend can query remaining cooldown via get-deposit-cooldown-blocks
;;
;; Vault Tracking:
;; - Uses user-vaults map to track vault-ids created by each principal
;; - Uses vault-creation-time to log creation timestamps
;; - Enables efficient vault limit validation
(define-constant MAX_VAULTS_PER_USER u10)

;; Minimum blocks required between deposits for same vault (rate limiting)
(define-constant MIN_BLOCKS_BETWEEN_DEPOSITS u1)

;; Maximum deposit amount in a single transaction (in microSTX)
(define-constant MAX_DEPOSIT_AMOUNT u1000000000) ;; 1000 STX

;; Maximum vault amount (sum of all deposits)
(define-constant MAX_VAULT_TOTAL_AMOUNT u10000000000) ;; 10000 STX

;; ============================================
;; Variables
;; ============================================

(define-data-var penalty-destination principal tx-sender)

;; ============================================
;; Helper Functions
;; ============================================

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

;; Private: count user's existing vaults
;; Returns the number of vault IDs associated with the user
;; 
;; This function counts vaults for a user to enforce deposit/creation limits
;; @param user - Principal address of user to count vaults for
;; @return uint - Number of vaults owned by user
(define-private (count-user-vaults (user principal))
  (let ((user-vault-record (map-get? user-vaults { user: user })))
    (match user-vault-record
      record (len (get vault-ids record))
      u0
    )
  )
)

;; Private: validate deposit amount against limits
;; Checks both single deposit and total vault limits
;; Ensures deposits don't exceed maximum transaction size or vault total
;; 
;; @param current-vault-amount - Current amount in vault before deposit
;; @param deposit-amount - Amount being deposited in this transaction
;; @return bool - true if within limits, false otherwise
(define-private (is-deposit-within-limits (current-vault-amount uint) (deposit-amount uint))
  (and
    (<= deposit-amount MAX_DEPOSIT_AMOUNT)
    (<= (+ current-vault-amount deposit-amount) MAX_VAULT_TOTAL_AMOUNT)
  )
)

;; Private: check if deposit cooldown period has passed
;; Returns true if enough blocks have passed since last deposit
;; Implements rate limiting to prevent deposit spam
;;
;; @param vault-id - ID of vault to check cooldown for  
;; @return bool - true if cooldown satisfied, false if rate limited
(define-private (is-deposit-cooldown-satisfied (vault-id uint))
  (let ((last-deposit (map-get? vault-last-deposit-block { vault-id: vault-id })))
    (match last-deposit
      record 
        (>= (- block-height (get block-height record)) MIN_BLOCKS_BETWEEN_DEPOSITS)
      true ;; No previous deposit, so cooldown is satisfied
    )
  )
)

)

;; Private: validate withdrawal amount
;; Ensures withdrawal amount is positive and doesn't exceed vault balance
;;
;; @param vault-amount - Current amount in vault
;; @param withdrawal-amount - Amount being withdrawn (0 means full withdrawal)
;; @return bool - true if valid, false otherwise
(define-private (is-valid-withdrawal-amount (vault-amount uint) (withdrawal-amount uint))
  (if (is-eq withdrawal-amount u0)
    ;; Full withdrawal: balance must be positive
    (> vault-amount u0)
    ;; Partial withdrawal: amount must be positive and not exceed balance
    (and
      (> withdrawal-amount u0)
      (<= withdrawal-amount vault-amount)
    )
  )
)

;; Private: check if caller is authorized to initiate withdrawal
;; Only the vault creator can withdraw (they specify where funds go)
;;
;; @param creator - Original vault creator principal
;; @param caller - Principal attempting to withdraw
;; @return bool - true if caller is authorized
(define-private (is-authorized-withdrawer (creator principal) (caller principal))
  (is-eq caller creator)
)

;; Private: validate withdrawal recipient
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

;; ============================================
;; Public Functions - Vault Management
;; ============================================

;; Create a new vault.
;; enable-stacking: opt-in to PoX delegation while funds are locked.
;; stacking-pool: pool principal to delegate to (required when enable-stacking is true).
(define-public (create-vault (lock-duration uint) (initial-amount uint) (enable-stacking bool) (stacking-pool (optional principal)))
  (let
    ((vault-id (var-get vault-counter))
     (unlock-height (+ lock-duration block-height))
     (user-vault-count (count-user-vaults tx-sender)))

    ;; Validate inputs
    (asserts! (> initial-amount u0) ERR-INVALID-AMOUNT)
    (asserts! (> lock-duration u0) ERR-INVALID-HEIGHT)
    
    ;; Enforce vault creation limit
    (asserts! (< user-vault-count MAX_VAULTS_PER_USER) ERR-TOO-MANY-VAULTS)
    
    ;; Validate deposit amount is within limits
    (asserts! (is-deposit-within-limits u0 initial-amount) ERR-DEPOSIT-AMOUNT-EXCEEDED)

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
    
    ;; Track vault creation time
    (map-set vault-creation-time
      { vault-id: vault-id }
      { created-at: block-height }
    )
    
    ;; Track deposit time for rate limiting
    (map-set vault-last-deposit-block
      { vault-id: vault-id }
      { block-height: block-height }
    )
    
    ;; Update user's vault list
    (let ((user-vaults-record (default-to { vault-ids: (list) } (map-get? user-vaults { user: tx-sender })))
         (updated-vault-ids (unwrap! (as-max-len? (append (get vault-ids user-vaults-record) vault-id) u100) ERR-INVALID-AMOUNT)))
      (map-set user-vaults { user: tx-sender } { vault-ids: updated-vault-ids })
    )

    ;; Increment counter
    (var-set vault-counter (+ vault-id u1))
    
    ;; Emit vault creation event
    (print { event: "vault-created", vault-id: vault-id, creator: tx-sender, amount: initial-amount, unlock-height: unlock-height })

    (ok vault-id)
  )
)

;; Withdraw from a vault
(define-public (withdraw (vault-id uint))
  (let
    ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
     (recipient (get-withdrawal-recipient vault))
     (vault-amount (get amount vault))
    )
    
    ;; Verify caller is authorized to withdraw (vault creator)
    (asserts! (is-authorized-withdrawer (get creator vault) tx-sender) ERR-UNAUTHORIZED)
    
    ;; Verify vault is unlocked
    (asserts! (>= block-height (get unlock-height vault)) ERR-NOT-UNLOCKED)
    
    ;; Verify hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)
    
    ;; Validate withdrawal amount is valid
    (asserts! (is-valid-withdrawal-amount vault-amount u0) ERR-INVALID-WITHDRAWAL-AMOUNT)
    
    ;; Verify sufficient balance
    (asserts! (> vault-amount u0) ERR-INSUFFICIENT-BALANCE)
    
    ;; Verify recipient is valid
    (asserts! (is-valid-beneficiary recipient) ERR-RECIPIENT-CANNOT-WITHDRAW)

    ;; Revoke stacking delegation before transferring funds out
    (if (get stacking-enabled vault)
      (try-revoke-stacking)
      false
    )

    ;; Transfer funds to recipient (beneficiary or creator)
    (try! (as-contract (stx-transfer? vault-amount tx-sender recipient)))
    
    ;; Record withdrawal attempt for auditing
    (map-set withdrawal-attempts
      { vault-id: vault-id }
      { last-attempt-block: block-height }
    )
    
    ;; Record withdrawal history
    (map-set withdrawal-history
      { vault-id: vault-id }
      {
        withdrawal-time: block-height,
        withdrawal-block: block-height,
        amount-withdrawn: vault-amount,
        recipient: recipient,
        was-emergency: false
      }
    )
    
    ;; Mark as withdrawn
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { is-withdrawn: true })
    )
    
    ;; Emit detailed withdrawal event
    (print { 
      event: "vault-withdrawn", 
      vault-id: vault-id, 
      creator: (get creator vault),
      recipient: recipient, 
      amount: vault-amount,
      block-height: block-height,
      timestamp: block-timestamp
    })
    
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

;; ============================================
;; Read-Only Functions - Vault Queries
;; ============================================

;; Get vault details
(define-read-only (get-vault (vault-id uint))
  (map-get? vaults { vault-id: vault-id })
)

;; Get total vault count
(define-read-only (get-vault-count)
  (var-get vault-counter)
)

;; Check if vault creation is allowed for a user
;; Returns true if user hasn't reached max vaults limit
;;
;; @param user - Principal address to check
;; @return bool - true if user can create another vault
(define-read-only (can-create-vault (user principal))
  (< (count-user-vaults user) MAX_VAULTS_PER_USER)
)

;; Check if deposit is allowed for a vault (cooldown satisfied)
;; Returns true if enough blocks have passed since last deposit
;;
;; @param vault-id - ID of vault to check
;; @return bool - true if deposit allowed (no rate limit)
(define-read-only (can-deposit-to-vault (vault-id uint))
  (is-deposit-cooldown-satisfied vault-id)
)

;; Get remaining blocks before next deposit is allowed
;; Useful for UI to show countdown timer to users
;;
;; @param vault-id - ID of vault to check
;; @return uint - Number of blocks to wait (0 if ready)
(define-read-only (get-deposit-cooldown-blocks (vault-id uint))
  (let ((last-deposit (map-get? vault-last-deposit-block { vault-id: vault-id })))
    (match last-deposit
      record
        (let ((blocks-passed (- block-height (get block-height record)))
              (blocks-needed MIN_BLOCKS_BETWEEN_DEPOSITS))
          (if (>= blocks-passed blocks-needed)
            u0
            (- blocks-needed blocks-passed)
          )
        )
      u0
    )
  )
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

;; Validate a beneficiary address without setting it
;; Checks if address is valid and can be set as beneficiary for creator
;; Useful for frontend validation before calling set-beneficiary
(define-read-only (validate-beneficiary-address (beneficiary principal) (creator principal))
  (and
    (is-valid-beneficiary beneficiary)
    (not (is-eq beneficiary creator))
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
    
    ;; Enforce deposit cooldown period for rate limiting
    (asserts! (is-deposit-cooldown-satisfied vault-id) ERR-DEPOSIT-COOLDOWN-ACTIVE)
    
    ;; Validate deposit amount is within limits
    (asserts! (is-deposit-within-limits (get amount vault) amount) ERR-DEPOSIT-AMOUNT-EXCEEDED)

    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    ;; Update vault amount
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { amount: new-total })
    )
    
    ;; Update last deposit block for rate limiting
    (map-set vault-last-deposit-block
      { vault-id: vault-id }
      { block-height: block-height }
    )

    ;; Re-delegate with the updated total when stacking is active
    (if (and (get stacking-enabled vault) (is-some (get stacking-pool vault)))
      (let ((pool (unwrap-panic (get stacking-pool vault))))
        (try-revoke-stacking)
        (try-delegate-stacking new-total pool)
      )
      false
    )
    
    ;; Emit deposit event
    (print { event: "vault-deposit", vault-id: vault-id, depositor: tx-sender, amount: amount, new-total: new-total })

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
     (recipient (get-withdrawal-recipient vault))
     (vault-amount (get amount vault))
    )
    
    ;; Verify caller is authorized to withdraw (vault creator)
    (asserts! (is-authorized-withdrawer (get creator vault) tx-sender) ERR-UNAUTHORIZED)
    
    ;; Verify vault hasn't been withdrawn
    (asserts! (not (get is-withdrawn vault)) ERR-ALREADY-WITHDRAWN)
    
    ;; Validate withdrawal amount is valid
    (asserts! (is-valid-withdrawal-amount vault-amount u0) ERR-INVALID-WITHDRAWAL-AMOUNT)
    
    ;; Verify sufficient balance
    (asserts! (> vault-amount u0) ERR-INSUFFICIENT-BALANCE)
    
    ;; Verify recipient is valid
    (asserts! (is-valid-beneficiary recipient) ERR-RECIPIENT-CANNOT-WITHDRAW)

    ;; Revoke stacking delegation before transferring funds out
    (if (get stacking-enabled vault)
      (try-revoke-stacking)
      false
    )

    ;; Transfer user amount to recipient
    (try! (as-contract (stx-transfer? user-amount tx-sender recipient)))
    
    ;; Transfer penalty to destination
    (try! (as-contract (stx-transfer? penalty-amount tx-sender (var-get penalty-destination))))
    
    ;; Record withdrawal attempt for auditing
    (map-set withdrawal-attempts
      { vault-id: vault-id }
      { last-attempt-block: block-height }
    )
    
    ;; Record withdrawal history
    (map-set withdrawal-history
      { vault-id: vault-id }
      {
        withdrawal-time: block-height,
        withdrawal-block: block-height,
        amount-withdrawn: user-amount,
        recipient: recipient,
        was-emergency: true
      }
    )
    
    ;; Emit detailed event for indexing and auditing
    (print { 
      event: "emergency-withdrawal", 
      vault-id: vault-id,
      creator: (get creator vault),
      amount: user-amount, 
      penalty: penalty-amount, 
      recipient: recipient,
      penalty-destination: (var-get penalty-destination),
      block-height: block-height,
      timestamp: block-timestamp
    })
    
    ;; Mark as withdrawn
    (map-set vaults
      { vault-id: vault-id }
      (merge vault { is-withdrawn: true })
    )
    
    ;; Burn NFT receipt on emergency withdrawal
    (try! (contract-call? 'ST1VAULT_NFT_ADDRESS.flut-nft burn-vault-receipt vault-id (get creator vault)))
    
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

;; ============================================
;; Read-Only Functions - Operation Limits
;; ============================================

;; Get maximum vaults allowed per user
(define-read-only (get-max-vaults-per-user)
  MAX_VAULTS_PER_USER
)

;; Get minimum blocks between deposits (rate limit)
(define-read-only (get-min-blocks-between-deposits)
  MIN_BLOCKS_BETWEEN_DEPOSITS
)

;; Get maximum deposit amount per transaction
(define-read-only (get-max-deposit-amount)
  MAX_DEPOSIT_AMOUNT
)

;; Get maximum total vault amount
(define-read-only (get-max-vault-total-amount)
  MAX_VAULT_TOTAL_AMOUNT
)

;; Check if additional deposit would exceed limits
(define-read-only (can-deposit-amount (vault-id uint) (deposit-amount uint))
  (let ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (is-deposit-within-limits (get amount v) deposit-amount)
      false
    )
  )
)

;; Get vault creation timestamp
(define-read-only (get-vault-creation-time (vault-id uint))
  (let ((creation-record (map-get? vault-creation-time { vault-id: vault-id })))
    (match creation-record
      record (some (get created-at record))
      none
    )
  )
)

;; Get last deposit timestamp for rate limiting
(define-read-only (get-vault-last-deposit-block (vault-id uint))
  (let ((deposit-record (map-get? vault-last-deposit-block { vault-id: vault-id })))
    (match deposit-record
      record (some (get block-height record))
      none
    )
  )
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

;; ============================================
;; Read-Only Functions - Withdrawal Status
;; ============================================

;; Check if vault has been withdrawn
(define-read-only (is-vault-withdrawn (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (get is-withdrawn v)
      false
    )
  )
)

;; Check readiness for withdrawal (creator and unlocked)
(define-read-only (can-withdraw-vault (vault-id uint) (caller principal))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (and
          (is-authorized-withdrawer (get creator v) caller)
          (>= block-height (get unlock-height v))
          (not (get is-withdrawn v))
        )
      false
    )
  )
)

;; Get withdrawal history for vault
(define-read-only (get-withdrawal-history (vault-id uint))
  (map-get? withdrawal-history { vault-id: vault-id })
)

;; Get last withdrawal attempt block
(define-read-only (get-vault-last-withdrawal-attempt (vault-id uint))
  (let ((attempt-record (map-get? withdrawal-attempts { vault-id: vault-id })))
    (match attempt-record
      record (some (get last-attempt-block record))
      none
    )
  )
)

;; Check if vault is ready for emergency withdrawal
(define-read-only (can-emergency-withdraw-vault (vault-id uint) (caller principal))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (and
          (is-authorized-withdrawer (get creator v) caller)
          (not (get is-withdrawn v))
          (> (get amount v) u0)
        )
      false
    )
  )
)

;; Get expected amounts for emergency withdrawal (including penalty)
(define-read-only (get-emergency-withdrawal-info (vault-id uint))
  (let
    ((vault (map-get? vaults { vault-id: vault-id })))
    (match vault
      v (let
          ((total-amount (get amount v))
           (penalty (calculate-penalty total-amount))
           (user-receives (- total-amount penalty)))
          (some {
            total-amount: total-amount,
            penalty-amount: penalty,
            user-receives: user-receives,
            penalty-rate: PENALTY_RATE,
            penalty-destination: (var-get penalty-destination)
          })
        )
      none
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
