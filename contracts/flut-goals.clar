;; Flut Goals - Savings Goal Tracker
;; Users set a target amount for a vault; anyone can contribute toward it.
(define-map goals {goal-id: uint} {owner: principal, label: (string-ascii 60), target: uint, saved: uint, reached: bool, finalized: bool})
(define-data-var goal-counter uint u0)

(define-constant ERR-NOT-FOUND (err u1))
(define-constant ERR-UNAUTHORIZED (err u2))
(define-constant ERR-ALREADY-REACHED (err u3))
(define-constant ERR-NOT-REACHED (err u4))
(define-constant ERR-ZERO-AMOUNT (err u5))
(define-constant ERR-ZERO-TARGET (err u6))

(define-public (create-goal (label (string-ascii 60)) (target uint))
  (let ((id (var-get goal-counter)))
    (asserts! (> target u0) ERR-ZERO-TARGET)
    (map-set goals {goal-id: id} {owner: tx-sender, label: label, target: target, saved: u0, reached: false, finalized: false})
    (var-set goal-counter (+ id u1))
    (ok id)))

(define-public (contribute (goal-id uint) (amount uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (begin
      (asserts! (> amount u0) ERR-ZERO-AMOUNT)
      (asserts! (not (get reached goal)) ERR-ALREADY-REACHED)
      (asserts! (not (get finalized goal)) ERR-ALREADY-REACHED)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (let ((new-saved (+ (get saved goal) amount))
            (reached (>= (+ (get saved goal) amount) (get target goal))))
        (map-set goals {goal-id: goal-id} (merge goal {saved: new-saved, reached: reached}))
        (ok reached)))
    ERR-NOT-FOUND))

(define-public (withdraw-goal (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (begin
      (asserts! (is-eq (get owner goal) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (get reached goal) ERR-NOT-REACHED)
      (asserts! (not (get finalized goal)) ERR-ALREADY-REACHED)
      (let ((caller tx-sender))
        (try! (as-contract (stx-transfer? (get saved goal) tx-sender caller))))
      (map-set goals {goal-id: goal-id} (merge goal {saved: u0, finalized: true}))
      (ok true))
    ERR-NOT-FOUND))

(define-read-only (get-goal (goal-id uint))
  (map-get? goals {goal-id: goal-id}))
