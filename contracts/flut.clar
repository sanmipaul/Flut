;; Flut - STX Savings Vault
(define-map vaults {vault-id: uint} {owner: principal, amount: uint, unlock-height: uint, withdrawn: bool})
(define-data-var vault-counter uint u0)

(define-constant ERR-NOT-FOUND (err u1))
(define-constant ERR-UNAUTHORIZED (err u2))
(define-constant ERR-LOCKED (err u3))
(define-constant ERR-WITHDRAWN (err u4))
(define-constant ERR-INVALID-HEIGHT (err u5))
(define-constant ERR-ZERO-AMOUNT (err u6))
(define-constant ERR-EMPTY-VAULT (err u7))
(define-constant ERR-HEIGHT-TOO-FAR (err u8))
(define-constant MAX-LOCK-BLOCKS u52560)

(define-public (create-vault (amount uint) (unlock-height uint))
  (let ((id (var-get vault-counter)))
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (> unlock-height block-height) ERR-INVALID-HEIGHT)
    (asserts! (<= (- unlock-height block-height) MAX-LOCK-BLOCKS) ERR-HEIGHT-TOO-FAR)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set vaults {vault-id: id} {owner: tx-sender, amount: amount, unlock-height: unlock-height, withdrawn: false})
    (var-set vault-counter (+ id u1))
    (ok id)))

(define-public (deposit (vault-id uint) (amount uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (begin
      (asserts! (> amount u0) ERR-ZERO-AMOUNT)
      (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (get withdrawn vault)) ERR-WITHDRAWN)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (map-set vaults {vault-id: vault-id} (merge vault {amount: (+ (get amount vault) amount)}))
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
