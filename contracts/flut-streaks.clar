;; Flut Streaks - Recurring Deposit Habit Tracker
;; Users commit to depositing once every N blocks; missing breaks the streak.
(define-map streaks {user: principal} {interval: uint, last-deposit: uint, count: uint, total: uint, broken: bool})

(define-constant ERR-TOO-EARLY (err u1))
(define-constant ERR-NO-STREAK (err u2))

(define-public (start-streak (amount uint) (interval uint))
  (begin
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set streaks {user: tx-sender} {interval: interval, last-deposit: block-height, count: u1, total: amount, broken: false})
    (ok true)))

(define-public (deposit-streak (amount uint))
  (match (map-get? streaks {user: tx-sender})
    streak (begin
      (asserts! (>= block-height (+ (get last-deposit streak) (get interval streak))) ERR-TOO-EARLY)
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (let ((on-time (< block-height (+ (get last-deposit streak) (* (get interval streak) u2))))
            (new-count (if on-time (+ (get count streak) u1) u1)))
        (map-set streaks {user: tx-sender} (merge streak {last-deposit: block-height, count: new-count, total: (+ (get total streak) amount), broken: (not on-time)}))
        (ok new-count)))
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
