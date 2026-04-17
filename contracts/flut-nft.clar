;; Flut Vault NFT Receipt
(define-non-fungible-token vault-receipt uint)
(define-map receipt-meta {token-id: uint} {vault-id: uint, amount: uint, unlock-height: uint, uri: (string-ascii 80)})
(define-data-var token-counter uint u0)
(define-data-var contract-owner principal tx-sender)
(define-data-var base-uri (string-ascii 60) "https://flut.app/nft/")

(define-constant ERR-UNAUTHORIZED (err u1))
(define-constant ERR-NOT-FOUND (err u2))
(define-constant ERR-ZERO-AMOUNT (err u3))

(define-private (build-token-uri (token-id uint))
  (unwrap-panic (as-max-len? (concat (var-get base-uri) (int-to-ascii token-id)) u80)))

(define-public (mint (owner principal) (vault-id uint) (amount uint) (unlock-height uint))
  (let ((id (var-get token-counter)))
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (try! (nft-mint? vault-receipt id owner))
    (map-set receipt-meta {token-id: id} {vault-id: vault-id, amount: amount, unlock-height: unlock-height, uri: (build-token-uri id)})
    (var-set token-counter (+ id u1))
    (ok id)))

(define-public (burn (token-id uint))
  (begin
    (asserts! (is-eq (some tx-sender) (nft-get-owner? vault-receipt token-id)) ERR-UNAUTHORIZED)
    (try! (nft-burn? vault-receipt token-id tx-sender))
    (map-delete receipt-meta {token-id: token-id})
    (ok true)))

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-UNAUTHORIZED)
    (nft-transfer? vault-receipt token-id sender recipient)))

(define-public (set-base-uri (new-uri (string-ascii 60)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set base-uri new-uri)
    (ok true)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? vault-receipt token-id)))

(define-read-only (get-token-uri (token-id uint))
  (match (map-get? receipt-meta {token-id: token-id})
    meta (ok (some (get uri meta)))
    ERR-NOT-FOUND))

(define-read-only (get-meta (token-id uint))
  (map-get? receipt-meta {token-id: token-id}))

(define-read-only (get-last-token-id)
  (ok (var-get token-counter)))

(define-read-only (get-base-uri)
  (ok (var-get base-uri)))

(define-read-only (token-exists (token-id uint))
  (is-some (map-get? receipt-meta {token-id: token-id})))

(define-read-only (get-token-vault-id (token-id uint))
  (match (map-get? receipt-meta {token-id: token-id})
    meta (ok (get vault-id meta))
    ERR-NOT-FOUND))

(define-read-only (get-token-amount (token-id uint))
  (match (map-get? receipt-meta {token-id: token-id})
    meta (ok (get amount meta))
    ERR-NOT-FOUND))

(define-read-only (get-token-unlock-height (token-id uint))
  (match (map-get? receipt-meta {token-id: token-id})
    meta (ok (get unlock-height meta))
    ERR-NOT-FOUND))

(define-read-only (is-token-unlocked (token-id uint))
  (match (map-get? receipt-meta {token-id: token-id})
    meta (ok (>= block-height (get unlock-height meta)))
    ERR-NOT-FOUND))

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner)))

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set contract-owner new-owner)
    (ok true)))

(define-read-only (get-token-summary (token-id uint))
  (match (map-get? receipt-meta {token-id: token-id})
    meta (ok {
      vault-id: (get vault-id meta),
      amount: (get amount meta),
      unlock-height: (get unlock-height meta),
      uri: (get uri meta),
      owner: (nft-get-owner? vault-receipt token-id),
      unlocked: (>= block-height (get unlock-height meta))
    })
    ERR-NOT-FOUND))
