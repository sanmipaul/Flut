;; Test suite for Flut smart contract
;; Tests cover vault creation, deposits, withdrawals, and beneficiary functionality

(use-trait sip10-trait 'ST1NXBK3K5YYMD6FD41SVHEX0288FY19MP1ECYEA.sip-010-trait-ft.sip-010-trait)

;; Helper function to advance blocks
(define-private (advance-blocks (blocks uint))
  (let loop ((i u0))
    (if (< i blocks)
      (begin
        (block-height)
        (loop (+ i u1))
      )
      true
    )
  )
)
