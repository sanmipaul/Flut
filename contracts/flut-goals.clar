;; Flut Goals - Savings Goal Tracker
;; Users set a target amount for a vault; anyone can contribute toward it.
(define-map goals {goal-id: uint} {owner: principal, label: (string-ascii 60), target: uint, saved: uint, reached: bool, finalized: bool, cancelled: bool})
(define-map goal-contributions {goal-id: uint, contributor: principal} {amount: uint})
(define-data-var goal-counter uint u0)

(define-constant ERR-NOT-FOUND (err u1))
(define-constant ERR-UNAUTHORIZED (err u2))
(define-constant ERR-ALREADY-REACHED (err u3))
(define-constant ERR-NOT-REACHED (err u4))
(define-constant ERR-ZERO-AMOUNT (err u5))
(define-constant ERR-ZERO-TARGET (err u6))
(define-constant ERR-GOAL-CLOSED (err u7))
(define-constant ERR-GOAL-CANCELLED (err u8))
(define-constant ERR-NOT-CANCELLED (err u9))
(define-constant ERR-NOTHING-TO-REFUND (err u10))

(define-public (create-goal (label (string-ascii 60)) (target uint))
  (let ((id (var-get goal-counter)))
    (asserts! (> target u0) ERR-ZERO-TARGET)
    (map-set goals {goal-id: id} {owner: tx-sender, label: label, target: target, saved: u0, reached: false, finalized: false, cancelled: false})
    (var-set goal-counter (+ id u1))
    (ok id)))

(define-public (contribute (goal-id uint) (amount uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (begin
      (asserts! (> amount u0) ERR-ZERO-AMOUNT)
      (asserts! (not (get finalized goal)) ERR-GOAL-CLOSED)
      (asserts! (not (get cancelled goal)) ERR-GOAL-CANCELLED)
      (asserts! (not (get reached goal)) ERR-ALREADY-REACHED)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (let ((prev (default-to u0 (get amount (map-get? goal-contributions {goal-id: goal-id, contributor: tx-sender}))))
            (new-saved (+ (get saved goal) amount))
            (reached (>= (+ (get saved goal) amount) (get target goal))))
        (map-set goal-contributions {goal-id: goal-id, contributor: tx-sender} {amount: (+ prev amount)})
        (map-set goals {goal-id: goal-id} (merge goal {saved: new-saved, reached: reached}))
        (ok reached)))
    ERR-NOT-FOUND))

(define-public (cancel-goal (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (begin
      (asserts! (is-eq (get owner goal) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (not (get reached goal)) ERR-ALREADY-REACHED)
      (asserts! (not (get finalized goal)) ERR-GOAL-CLOSED)
      (asserts! (not (get cancelled goal)) ERR-GOAL-CANCELLED)
      (map-set goals {goal-id: goal-id} (merge goal {cancelled: true}))
      (ok true))
    ERR-NOT-FOUND))

(define-public (refund-contribution (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (begin
      (asserts! (get cancelled goal) ERR-NOT-CANCELLED)
      (let ((amount (default-to u0 (get amount (map-get? goal-contributions {goal-id: goal-id, contributor: tx-sender}))))
            (caller tx-sender))
        (asserts! (> amount u0) ERR-NOTHING-TO-REFUND)
        (try! (as-contract (stx-transfer? amount tx-sender caller)))
        (map-set goal-contributions {goal-id: goal-id, contributor: tx-sender} {amount: u0})
        (ok amount)))
    ERR-NOT-FOUND))

(define-public (withdraw-goal (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (begin
      (asserts! (is-eq (get owner goal) tx-sender) ERR-UNAUTHORIZED)
      (asserts! (get reached goal) ERR-NOT-REACHED)
      (asserts! (not (get finalized goal)) ERR-GOAL-CLOSED)
      (let ((caller tx-sender))
        (try! (as-contract (stx-transfer? (get saved goal) tx-sender caller))))
      (map-set goals {goal-id: goal-id} (merge goal {saved: u0, finalized: true}))
      (ok true))
    ERR-NOT-FOUND))

(define-read-only (get-goal (goal-id uint))
  (map-get? goals {goal-id: goal-id}))

(define-read-only (get-goal-count)
  (ok (var-get goal-counter)))

(define-read-only (is-goal-reached (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (get reached goal))
    ERR-NOT-FOUND))

(define-read-only (is-goal-finalized (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (get finalized goal))
    ERR-NOT-FOUND))

(define-read-only (get-goal-progress (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok {
      saved: (get saved goal),
      target: (get target goal),
      remaining: (if (>= (get saved goal) (get target goal))
                     u0
                     (- (get target goal) (get saved goal))),
      reached: (get reached goal),
      finalized: (get finalized goal)
    })
    ERR-NOT-FOUND))

(define-read-only (can-contribute (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (and (not (get reached goal)) (not (get finalized goal)) (not (get cancelled goal))))
    ERR-NOT-FOUND))

(define-read-only (can-withdraw-goal (goal-id uint) (caller principal))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (and (is-eq (get owner goal) caller)
                   (get reached goal)
                   (not (get finalized goal))))
    ERR-NOT-FOUND))

(define-read-only (get-goal-label (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (get label goal))
    ERR-NOT-FOUND))

(define-read-only (get-goal-owner (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (get owner goal))
    ERR-NOT-FOUND))

(define-read-only (goal-exists (goal-id uint))
  (is-some (map-get? goals {goal-id: goal-id})))

(define-read-only (get-contribution-headroom (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (if (>= (get saved goal) (get target goal))
                 u0
                 (- (get target goal) (get saved goal))))
    ERR-NOT-FOUND))

(define-read-only (get-goal-saved (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (get saved goal))
    ERR-NOT-FOUND))

(define-read-only (can-refund (goal-id uint) (contributor principal))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (and
      (get cancelled goal)
      (> (default-to u0 (get amount (map-get? goal-contributions {goal-id: goal-id, contributor: contributor}))) u0)))
    ERR-NOT-FOUND))

(define-read-only (get-contribution-amount (goal-id uint) (contributor principal))
  (ok (default-to u0 (get amount (map-get? goal-contributions {goal-id: goal-id, contributor: contributor})))))

(define-read-only (is-goal-cancelled (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (get cancelled goal))
    ERR-NOT-FOUND))

(define-read-only (get-goal-target (goal-id uint))
  (match (map-get? goals {goal-id: goal-id})
    goal (ok (get target goal))
    ERR-NOT-FOUND))
