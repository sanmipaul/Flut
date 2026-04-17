;; Flut - STX Savings Vault
(define-map vaults {vault-id: uint} {owner: principal, amount: uint, unlock-height: uint, withdrawn: bool})
(define-data-var vault-counter uint u0)
(define-map pending-owner {vault-id: uint} {new-owner: principal})

(define-constant ERR-NOT-FOUND (err u1))
(define-constant ERR-UNAUTHORIZED (err u2))
(define-constant ERR-LOCKED (err u3))
(define-constant ERR-WITHDRAWN (err u4))
(define-constant ERR-INVALID-HEIGHT (err u5))
(define-constant ERR-SAME-OWNER (err u8))
(define-constant ERR-NO-PENDING-TRANSFER (err u9))

(define-public (create-vault (amount uint) (unlock-height uint))
  (let ((id (var-get vault-counter)))
    (asserts! (> unlock-height block-height) ERR-INVALID-HEIGHT)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set vaults {vault-id: id} {owner: tx-sender, amount: amount, unlock-height: unlock-height, withdrawn: false})
    (var-set vault-counter (+ id u1))
    (ok id)))

(define-public (deposit (vault-id uint) (amount uint))
  (match (map-get? vaults {vault-id: vault-id})
    vault (begin
      (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (get withdrawn vault)) ERR-WITHDRAWN)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (map-set vaults {vault-id: vault-id} (merge vault {amount: (+ (get amount vault) amount)}))
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
      (let ((caller tx-sender))
        (try! (as-contract (stx-transfer? (get amount vault) tx-sender caller))))
      (map-set vaults {vault-id: vault-id} (merge vault {withdrawn: true}))
      (ok true))
    ERR-NOT-FOUND))

(define-read-only (get-vault (vault-id uint))
  (map-get? vaults {vault-id: vault-id}))
