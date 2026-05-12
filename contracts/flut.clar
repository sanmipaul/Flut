;; Flut - STX Savings Vault
(define-map vaults {vault-id: uint} {owner: principal, amount: uint, unlock-height: uint, withdrawn: bool, last-deposit-height: uint, total-deposited: uint, is-emergency-withdrawal-enabled: bool, emergency-withdrawal-penalty-bps: uint})
(define-map vault-beneficiaries {vault-id: uint, beneficiary: principal} {shares: uint, withdrawn-amount: uint})
(define-data-var vault-counter uint u0)
(define-map pending-owner {vault-id: uint} {new-owner: principal})

(define-constant ERR-NOT-FOUND (err u1))
(define-constant ERR-UNAUTHORIZED (err u2))
(define-constant ERR-LOCKED (err u3))
(define-constant ERR-WITHDRAWN (err u4))
(define-constant ERR-INVALID-HEIGHT (err u5))
(define-constant ERR-ZERO-AMOUNT (err u6))
(define-constant ERR-EMPTY-VAULT (err u7))
(define-constant ERR-HEIGHT-TOO-FAR (err u8))
(define-constant ERR-VAULT-CLOSED (err u9))
(define-constant ERR-SAME-OWNER (err u10))
(define-constant ERR-DEPOSIT-COOLDOWN-ACTIVE (err u11))
(define-constant ERR-DEPOSIT-AMOUNT-EXCEEDED (err u12))
(define-constant ERR-VAULT-AMOUNT-EXCEEDED (err u13))
(define-constant ERR-INSUFFICIENT-BALANCE (err u14))
(define-constant ERR-INVALID-WITHDRAWAL-AMOUNT (err u15))
(define-constant ERR-RECIPIENT-CANNOT-WITHDRAW (err u16))
(define-constant ERR-WITHDRAWAL-NOT-ALLOWED (err u17))
(define-constant ERR-EMERGENCY-WITHDRAWAL-DISABLED (err u18))
(define-constant ERR-INVALID-PENALTY-RATE (err u19))
(define-constant MAX-LOCK-BLOCKS u52560)
(define-constant DEPOSIT-COOLDOWN-BLOCKS u144)
(define-constant MAX-SINGLE-DEPOSIT u1000000000000) ;; 1M STX in micro-STX
(define-constant MAX-VAULT-BALANCE u5000000000000) ;; 5M STX in micro-STX

(define-public (create-vault (amount uint) (unlock-height uint))
  (let ((id (var-get vault-counter)))
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (> unlock-height block-height) ERR-INVALID-HEIGHT)
    (asserts! (<= (- unlock-height block-height) MAX-LOCK-BLOCKS) ERR-HEIGHT-TOO-FAR)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set vaults {vault-id: id} {owner: tx-sender, amount: amount, unlock-height: unlock-height, withdrawn: false, last-deposit-height: block-height, total-deposited: amount, is-emergency-withdrawal-enabled: false, emergency-withdrawal-penalty-bps: u0})
    (var-set vault-counter (+ id u1))
    (ok id)))

(define-public (deposit (vault-id uint) (amount uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (begin
      (asserts! (> amount u0) ERR-ZERO-AMOUNT)
      (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (get withdrawn vault)) ERR-VAULT-CLOSED)
      (asserts! (>= (- block-height (get last-deposit-height vault)) DEPOSIT-COOLDOWN-BLOCKS) ERR-DEPOSIT-COOLDOWN-ACTIVE)
      (asserts! (<= amount MAX-SINGLE-DEPOSIT) ERR-DEPOSIT-AMOUNT-EXCEEDED)
      (let ((new-balance (+ (get amount vault) amount)))
        (asserts! (<= new-balance MAX-VAULT-BALANCE) ERR-VAULT-AMOUNT-EXCEEDED)
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (map-set vaults {vault-id: vault-id} (merge vault {amount: new-balance, last-deposit-height: block-height, total-deposited: (+ (get total-deposited vault) amount)})))
      (ok true))
    ERR-NOT-FOUND))


(define-public (initiate-ownership-transfer (vault-id uint) (new-owner principal))
  (match (map-get? vaults {vault-id: vault-id})
    vault (begin
      (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (is-eq new-owner tx-sender)) ERR-SAME-OWNER)
      (asserts! (not (get withdrawn vault)) ERR-WITHDRAWN)
      (map-set pending-owner {vault-id: vault-id} {new-owner: new-owner})
      (ok true))
    ERR-NOT-FOUND))

(define-public (withdraw (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (begin
      (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (>= block-height (get unlock-height vault)) ERR-LOCKED)
      (asserts! (not (get withdrawn vault)) ERR-WITHDRAWN)
      (asserts! (> (get amount vault) u0) ERR-EMPTY-VAULT)
      (let ((caller tx-sender))
        (try! (as-contract (stx-transfer? (get amount vault) tx-sender caller))))
      (map-set vaults {vault-id: vault-id} (merge vault {withdrawn: true}))
      (ok true))
    ERR-NOT-FOUND))

(define-public (set-emergency-withdrawal-enabled (vault-id uint) (enabled bool))
  (match (map-get? vaults {vault-id: vault-id})
    vault (begin
      (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (get withdrawn vault)) ERR-WITHDRAWN)
      (map-set vaults {vault-id: vault-id} (merge vault {is-emergency-withdrawal-enabled: enabled}))
      (ok true))
    ERR-NOT-FOUND))

(define-public (set-emergency-withdrawal-penalty (vault-id uint) (penalty-bps uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (begin
      (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (get withdrawn vault)) ERR-WITHDRAWN)
      (asserts! (<= penalty-bps u1000) ERR-INVALID-PENALTY-RATE) ;; max 10%
      (map-set vaults {vault-id: vault-id} (merge vault {emergency-withdrawal-penalty-bps: penalty-bps}))
      (ok true))
    ERR-NOT-FOUND))

(define-read-only (get-vault (vault-id uint))
  (map-get? vaults {vault-id: vault-id}))

(define-read-only (get-vault-count)
  (ok (var-get vault-counter)))

(define-read-only (vault-exists (vault-id uint))
  (is-some (map-get? vaults {vault-id: vault-id})))

(define-read-only (is-vault-unlocked (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (>= block-height (get unlock-height vault)))
    ERR-NOT-FOUND))

(define-read-only (get-vault-balance (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (get amount vault))
    ERR-NOT-FOUND))

(define-read-only (get-vault-owner (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (get owner vault))
    ERR-NOT-FOUND))

(define-read-only (is-vault-withdrawn (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (get withdrawn vault))
    ERR-NOT-FOUND))

(define-read-only (get-blocks-until-unlock (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (if (>= block-height (get unlock-height vault))
                  u0
                  (- (get unlock-height vault) block-height)))
    ERR-NOT-FOUND))

(define-read-only (get-max-lock-blocks)
  (ok MAX-LOCK-BLOCKS))

(define-read-only (can-deposit (vault-id uint) (caller principal))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (and (is-eq (get owner vault) caller)
                   (not (get withdrawn vault))))
    ERR-NOT-FOUND))

(define-read-only (can-withdraw (vault-id uint) (caller principal))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (and (is-eq (get owner vault) caller)
                   (>= block-height (get unlock-height vault))
                   (not (get withdrawn vault))
                   (> (get amount vault) u0)))
    ERR-NOT-FOUND))

(define-read-only (get-vault-summary (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok {
      owner: (get owner vault),
      amount: (get amount vault),
      unlock-height: (get unlock-height vault),
      withdrawn: (get withdrawn vault),
      unlocked: (>= block-height (get unlock-height vault)),
      blocks-remaining: (if (>= block-height (get unlock-height vault))
                            u0
                            (- (get unlock-height vault) block-height))
    })
    ERR-NOT-FOUND))

(define-read-only (is-emergency-withdrawal-enabled (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (get is-emergency-withdrawal-enabled vault))
    ERR-NOT-FOUND))

(define-read-only (get-emergency-withdrawal-penalty-bps (vault-id uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (ok (get emergency-withdrawal-penalty-bps vault))
    ERR-NOT-FOUND))
