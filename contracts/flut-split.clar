;; Flut Split - Shared Vault for Group Savings
;; A group of up to 5 members each contribute; payout is distributed proportionally.
(define-map splits {split-id: uint} {creator: principal, target: uint, saved: uint, paid-out: bool, members: (list 5 principal)})
(define-map contributions {split-id: uint, member: principal} {amount: uint})
(define-data-var split-counter uint u0)

(define-constant ERR-NOT-FOUND (err u1))
(define-constant ERR-NOT-MEMBER (err u2))
(define-constant ERR-PAID-OUT (err u3))
(define-constant ERR-TARGET-NOT-MET (err u4))
(define-constant ERR-UNAUTHORIZED (err u5))
(define-constant ERR-ZERO-AMOUNT (err u6))
(define-constant ERR-ZERO-TARGET (err u7))

(define-private (is-member (user principal) (members (list 5 principal)))
  (or (is-eq user (unwrap-panic (element-at members u0)))
      (is-eq user (default-to user (element-at members u1)))
      (is-eq user (default-to user (element-at members u2)))
      (is-eq user (default-to user (element-at members u3)))
      (is-eq user (default-to user (element-at members u4)))))

(define-public (create-split (target uint) (members (list 5 principal)))
  (let ((id (var-get split-counter)))
    (map-set splits {split-id: id} {creator: tx-sender, target: target, saved: u0, paid-out: false, members: members})
    (var-set split-counter (+ id u1))
    (ok id)))

(define-public (contribute (split-id uint) (amount uint))
  (match (map-get? splits {split-id: split-id})
    split (begin
      (asserts! (is-member tx-sender (get members split)) ERR-NOT-MEMBER)
      (asserts! (not (get paid-out split)) ERR-PAID-OUT)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (let ((prev (default-to u0 (get amount (map-get? contributions {split-id: split-id, member: tx-sender})))))
        (map-set contributions {split-id: split-id, member: tx-sender} {amount: (+ prev amount)}))
      (map-set splits {split-id: split-id} (merge split {saved: (+ (get saved split) amount)}))
      (ok true))
    ERR-NOT-FOUND))

(define-public (payout (split-id uint) (recipient principal))
  (match (map-get? splits {split-id: split-id})
    split (begin
      (asserts! (is-eq (get creator split) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (get paid-out split)) ERR-PAID-OUT)
      (asserts! (>= (get saved split) (get target split)) ERR-TARGET-NOT-MET)
      (try! (as-contract (stx-transfer? (get saved split) tx-sender recipient)))
      (map-set splits {split-id: split-id} (merge split {paid-out: true}))
      (ok true))
    ERR-NOT-FOUND))

(define-read-only (get-split (split-id uint))
  (map-get? splits {split-id: split-id}))

(define-read-only (get-contribution (split-id uint) (member principal))
  (map-get? contributions {split-id: split-id, member: member}))
