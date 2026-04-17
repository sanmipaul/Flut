;; Flut Streaks - Recurring Deposit Habit Tracker
;; Users commit to depositing once every N blocks; missing breaks the streak.
(define-map streaks {user: principal} {interval: uint, last-deposit: uint, count: uint, total: uint, broken: bool, break-count: uint})

(define-constant ERR-TOO-EARLY (err u1))
(define-constant ERR-NO-STREAK (err u2))
(define-constant ERR-ZERO-AMOUNT (err u3))
(define-constant ERR-ZERO-INTERVAL (err u4))

(define-public (start-streak (amount uint) (interval uint))
  (begin
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (> interval u0) ERR-ZERO-INTERVAL)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set streaks {user: tx-sender} {interval: interval, last-deposit: block-height, count: u1, total: amount, broken: false, break-count: u0})
    (ok true)))

(define-public (deposit-streak (amount uint))
  (match (map-get? streaks {user: tx-sender})
    streak (begin
      (asserts! (> amount u0) ERR-ZERO-AMOUNT)
      (asserts! (>= block-height (+ (get last-deposit streak) (get interval streak))) ERR-TOO-EARLY)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (let ((on-time (< block-height (+ (get last-deposit streak) (* (get interval streak) u2))))
            (new-count (if on-time (+ (get count streak) u1) u1))
            (new-breaks (if on-time (get break-count streak) (+ (get break-count streak) u1))))
        (map-set streaks {user: tx-sender} (merge streak {
          last-deposit: block-height,
          count: new-count,
          total: (+ (get total streak) amount),
          broken: (not on-time),
          break-count: new-breaks
        }))
        (ok {count: new-count, was-broken: (not on-time)})))
    ERR-NO-STREAK))

(define-public (withdraw-streak)
  (match (map-get? streaks {user: tx-sender})
    streak (begin
      (let ((caller tx-sender))
        (try! (as-contract (stx-transfer? (get total streak) tx-sender caller))))
      (map-delete streaks {user: tx-sender})
      (ok true))
    ERR-NO-STREAK))

(define-read-only (get-streak (user principal))
  (map-get? streaks {user: user}))

(define-read-only (is-streak-broken (user principal))
  (match (map-get? streaks {user: user})
    streak (ok (get broken streak))
    ERR-NO-STREAK))

(define-read-only (get-streak-break-count (user principal))
  (match (map-get? streaks {user: user})
    streak (ok (get break-count streak))
    ERR-NO-STREAK))
