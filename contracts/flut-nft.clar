;; Flut Vault NFT Receipt
;; SIP-009 Compliant NFT Contract for Vault Receipts
;; Each created vault mints an NFT receipt to the vault owner

(impl-trait 'ST1NXBK3K5YYMD6FD41SVHEX0288FY19MP1ECYEA.sip-009-trait.nft-trait)

;; ============================================================================
;; CONSTANTS
;; ============================================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u1))
(define-constant ERR-NOT-FOUND (err u2))

;; ============================================================================
;; DATA STRUCTURES
;; ============================================================================

;; Track NFT metadata
(define-map nft-metadata
  { token-id: uint }
  {
    vault-id: uint,
    owner: principal,
    created-at: uint,
    vault-amount: uint,
    unlock-height: uint
  }
)

;; Track owner balance
(define-map balances
  { owner: principal }
  { balance: uint }
)

;; Token ownership tracking
(define-map token-owner
  { token-id: uint }
  { owner: principal }
)

;; Token count
(define-data-var token-counter uint u0)

;; ============================================================================
;; CORE SIP-009 FUNCTIONS
;; ============================================================================

;; Get the last token ID minted
(define-read-only (get-last-token-id)
  (ok (- (var-get token-counter) u1))
)

;; Get token count
(define-read-only (get-token-count)
  (ok (var-get token-counter))
)

;; Get balance of an owner
(define-read-only (get-balance (owner principal))
  (ok (default-to u0 (get balance (map-get? balances { owner: owner }))))
)

;; Get owner of a token
(define-read-only (get-owner (token-id uint))
  (ok (map-get? token-owner { token-id: token-id }))
)

;; Transfer an NFT
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    ;; Verify sender owns the token
    (asserts! (is-eq (ok sender) (get-owner token-id)) ERR-UNAUTHORIZED)
    
    ;; Update ownership
    (map-set token-owner { token-id: token-id } { owner: recipient })
    
    ;; Update balances
    (let ((sender-balance (default-to u0 (get balance (map-get? balances { owner: sender }))))
          (recipient-balance (default-to u0 (get balance (map-get? balances { owner: recipient })))))
      
      (map-set balances { owner: sender } { balance: (- sender-balance u1) })
      (map-set balances { owner: recipient } { balance: (+ recipient-balance u1) })
    )
    
    (ok true)
  )
)

;; ============================================================================
;; METADATA FUNCTIONS
;; ============================================================================

;; Get NFT metadata for a vault
(define-read-only (get-nft-metadata (token-id uint))
  (ok (map-get? nft-metadata { token-id: token-id }))
)

;; Get token URI for metadata access
(define-read-only (get-token-uri (token-id uint))
  (match (map-get? nft-metadata { token-id: token-id })
    metadata
      (let ((vault-id (get vault-id metadata))
            (owner (get owner metadata))
            (vault-amount (get vault-amount metadata))
            (unlock-height (get unlock-height metadata)))
        (ok (concat
          "https://ipfs.io/ipfs/flut-vault-nft/"
          (uint-to-string token-id)
        ))
      )
    (err ERR-NOT-FOUND)
  )
)

;; Helper function to convert uint to string
(define-read-only (uint-to-string (value uint))
  (if (is-eq value u0)
    "0"
    (if (< value u10)
      (if (is-eq value u1) "1"
      (if (is-eq value u2) "2"
      (if (is-eq value u3) "3"
      (if (is-eq value u4) "4"
      (if (is-eq value u5) "5"
      (if (is-eq value u6) "6"
      (if (is-eq value u7) "7"
      (if (is-eq value u8) "8"
      (if (is-eq value u9) "9" "0")))))))))
      "num"
    )
  )
)

;; Check if token exists
(define-read-only (token-exists (token-id uint))
  (ok (is-some (map-get? token-owner { token-id: token-id })))
)

;; Get all vaults for owner (limited list)
(define-read-only (get-vault-ids-for-owner (owner principal))
  (ok owner)
)

;; Get detailed metadata URI for token
(define-read-only (get-metadata-uri (token-id uint))
  (match (map-get? nft-metadata { token-id: token-id })
    metadata
      (ok (concat
        "data:application/json;base64,"
        "eyJuYW1lIjoiRmx1dCBWYXVsdCBSZWNlaXB0ICMiLCJkZXNjcmlwdGlvbiI6IkZsdXQgdmF1bHQgcmVjZWlwdCBORlQgcmVwcmVzZW50aW5nIHZhdWx0IG93bmVyc2hpcCBhbmQgcmVjZWlwdCBvZiBsb2NrZWQgU1RYIGZ1bmRzIiwiaW1hZ2UiOiJpcGZzOi8vUW1lY3l2V0s2SkY3QVdQUlo5TUFTa1laekhrUHRjb3QycFVuVHoySFE0OTJzNHQifQ=="
      ))
    (err ERR-NOT-FOUND)
  )
)

;; ============================================================================
;; INTERNAL MINTING FUNCTION
;; ============================================================================

;; Mint a new NFT for vault creation
(define-public (mint-vault-receipt (vault-id uint) (owner principal) (amount uint) (unlock-height uint))
  (let ((token-id (var-get token-counter)))
    
    ;; Store metadata
    (map-set nft-metadata
      { token-id: token-id }
      {
        vault-id: vault-id,
        owner: owner,
        created-at: block-height,
        vault-amount: amount,
        unlock-height: unlock-height
      }
    )
    
    ;; Set owner
    (map-set token-owner { token-id: token-id } { owner: owner })
    
    ;; Update balance
    (let ((current-balance (default-to u0 (get balance (map-get? balances { owner: owner })))))
      (map-set balances { owner: owner } { balance: (+ current-balance u1) })
    )
    
    ;; Increment counter
    (var-set token-counter (+ token-id u1))
    
    (ok token-id)
  )
)

;; ============================================================================
;; BURN FUNCTION
;; ============================================================================

;; Burn an NFT on vault withdrawal
(define-public (burn-vault-receipt (token-id uint) (owner principal))
  (begin
    ;; Verify owner
    (asserts! (is-eq (ok owner) (get-owner token-id)) ERR-UNAUTHORIZED)
    
    ;; Remove metadata
    (map-delete nft-metadata { token-id: token-id })
    
    ;; Remove ownership
    (map-delete token-owner { token-id: token-id })
    
    ;; Update balance
    (let ((current-balance (default-to u0 (get balance (map-get? balances { owner: owner })))))
      (map-set balances { owner: owner } { balance: (- current-balance u1) })
    )
    
    (ok true)
  )
)
