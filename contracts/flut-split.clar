;; Flut Split - Shared Vault for Group Savings
;; Each member claims their own proportional share once target is met.
(define-map splits {split-id: uint} {creator: principal, target: uint, saved: uint, paid-out: bool, members: (list 5 principal)})
(define-map contributions {split-id: uint, member: principal} {amount: uint})
(define-map claimed {split-id: uint, member: principal} {done: bool})
(define-data-var split-counter uint u0)

(define-constant ERR-NOT-FOUND (err u1))
(define-constant ERR-NOT-MEMBER (err u2))
(define-constant ERR-PAID-OUT (err u3))
(define-constant ERR-TARGET-NOT-MET (err u4))
(define-constant ERR-UNAUTHORIZED (err u5))
(define-constant ERR-ZERO-AMOUNT (err u6))
(define-constant ERR-ZERO-TARGET (err u7))
(define-constant ERR-ALREADY-CLAIMED (err u8))
(define-constant ERR-NOTHING-TO-CLAIM (err u9))

(define-private (is-member (user principal) (members (list 5 principal)))
  (or (is-eq user (unwrap-panic (element-at members u0)))
      (is-eq user (default-to user (element-at members u1)))
      (is-eq user (default-to user (element-at members u2)))
      (is-eq user (default-to user (element-at members u3)))
      (is-eq user (default-to user (element-at members u4)))))

(define-public (create-split (target uint) (members (list 5 principal)))
  (let ((id (var-get split-counter)))
    (asserts! (> target u0) ERR-ZERO-TARGET)
    (map-set splits {split-id: id} {creator: tx-sender, target: target, saved: u0, paid-out: false, members: members})
    (var-set split-counter (+ id u1))
    (ok id)))

(define-public (contribute (split-id uint) (amount uint))
  (match (map-get? splits {split-id: split-id})
    split (begin
      (asserts! (> amount u0) ERR-ZERO-AMOUNT)
      (asserts! (is-member tx-sender (get members split)) ERR-NOT-MEMBER)
      (asserts! (not (get paid-out split)) ERR-PAID-OUT)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (let ((prev (default-to u0 (get amount (map-get? contributions {split-id: split-id, member: tx-sender})))))
        (map-set contributions {split-id: split-id, member: tx-sender} {amount: (+ prev amount)}))
      (map-set splits {split-id: split-id} (merge split {saved: (+ (get saved split) amount)}))
      (ok true))
    ERR-NOT-FOUND))

(define-public (claim-share (split-id uint))
  (match (map-get? splits {split-id: split-id})
    split (begin
      (asserts! (is-member tx-sender (get members split)) ERR-NOT-MEMBER)
      (asserts! (>= (get saved split) (get target split)) ERR-TARGET-NOT-MET)
      (asserts! (not (default-to false (get done (map-get? claimed {split-id: split-id, member: tx-sender})))) ERR-ALREADY-CLAIMED)
      (let ((share (default-to u0 (get amount (map-get? contributions {split-id: split-id, member: tx-sender}))))
            (caller tx-sender))
        (asserts! (> share u0) ERR-NOTHING-TO-CLAIM)
        (try! (as-contract (stx-transfer? share tx-sender caller)))
        (map-set claimed {split-id: split-id, member: tx-sender} {done: true})
        (ok share)))
    ERR-NOT-FOUND))

(define-read-only (get-split (split-id uint))
  (map-get? splits {split-id: split-id}))

(define-read-only (get-contribution (split-id uint) (member principal))
  (map-get? contributions {split-id: split-id, member: member}))

(define-read-only (has-claimed (split-id uint) (member principal))
  (default-to false (get done (map-get? claimed {split-id: split-id, member: member}))))

(define-read-only (get-split-count)
  (ok (var-get split-counter)))

(define-read-only (split-exists (split-id uint))
  (is-some (map-get? splits {split-id: split-id})))

(define-read-only (is-target-met (split-id uint))
  (match (map-get? splits {split-id: split-id})
    split (ok (>= (get saved split) (get target split)))
    ERR-NOT-FOUND))

(define-read-only (get-split-saved (split-id uint))
  (match (map-get? splits {split-id: split-id})
    split (ok (get saved split))
    ERR-NOT-FOUND))

(define-read-only (get-split-target (split-id uint))
  (match (map-get? splits {split-id: split-id})
    split (ok (get target split))
    ERR-NOT-FOUND))

(define-read-only (get-split-remaining (split-id uint))
  (match (map-get? splits {split-id: split-id})
    split (ok (if (>= (get saved split) (get target split))
                  u0
                  (- (get target split) (get saved split))))
    ERR-NOT-FOUND))
