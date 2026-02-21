/**
 * Penalty Configuration Guide
 * How to configure and customize the emergency withdrawal penalty system
 */

// ============================================================================
// CURRENT CONFIGURATION
// ============================================================================

// In contracts/flut.clar:
//
// (define-constant PENALTY_RATE u10)  // 10% penalty
// (define-data-var penalty-destination principal tx-sender)
//

// ============================================================================
// PENALTY RATE CONFIGURATION
// ============================================================================

/*
The PENALTY_RATE is currently set to 10 (representing 10%).

To modify:
1. Edit PENALTY_RATE in contracts/flut.clar
2. Examples:

   u5    - 5% penalty (lower incentive, more emergency access)
   u10   - 10% penalty (current, balanced approach)
   u15   - 15% penalty (higher incentive to preserve savings)
   u20   - 20% penalty (strict savings discipline)
   u25   - 25% penalty (very aggressive penalty regime)

3. Re-deploy contract with new rate
4. All new vaults use new rate
5. Existing vaults keep original rate (if tracked per vault)

RECOMMENDATION: Start at 10%, adjust based on early withdrawal rate telemetry
*/

// ============================================================================
// PENALTY DESTINATION CONFIGURATION
// ============================================================================

/*
Set who receives penalty funds via set-penalty-destination function:

Option A: Protocol Treasury
  Principal: ST1TREASURY_ADDRESS
  Benefit: Centralizes fees for protocol development
  Risk: Centralization concern

Option B: Burn Address
  Principal: SP000000000000000000002Q6VF78
  Benefit: Removes fees from circulation (deflationary)
  Risk: Permanent loss of capital

Option C: Governance DAO
  Principal: ST1DAO_GOVERNANCE_ADDRESS
  Benefit: Community controls fee allocation
  Risk: Governance complexity

Option D: Insurance Fund
  Principal: ST1INSURANCE_FUND_ADDRESS
  Benefit: Funds emergency insurance pool
  Risk: Requires separate management

RECOMMENDATION: Use DAO treasury, allow community governance on allocation
*/

// ============================================================================
// DEPLOYMENT CONFIGURATION CHECKLIST
// ============================================================================

/*
□ Set PENALTY_RATE constant (default: u10)
□ Set initial penalty-destination via set-penalty-destination
  - Deploy with temporary address
  - Update to final address after deployment
□ Test penalty calculations with edge cases
□ Verify penalty transfers work correctly
□ Set up event monitoring/indexing for emergency withdrawals
□ Document penalty rate in governance proposals
□ Communicate penalty rate to users clearly
*/

// ============================================================================
// MONITORING & ANALYTICS
// ============================================================================

/*
Track emergency withdrawals:

Key Metrics:
- Count of emergency withdrawals vs normal withdrawals
- Total penalty collected
- Average vault age at emergency withdrawal
- Time distribution (clustering around specific events?)
- Penalty destination balance growth

Via Contract Events:
All emergency withdrawals emit:
  (print { event: "emergency-withdrawal", vault-id: ..., amount: ..., penalty: ... })

Use Stacks event listener to capture and store in database
*/

// ============================================================================
// GOVERNANCE & UPDATES
// ============================================================================

/*
Future Protocol Upgrades:

v1 (Current):
- Fixed 10% penalty
- Single penalty destination
- Simple calculation

v2 (Proposed):
- Governance-controlled penalty rate
- Multiple fee recipients (split %)
- Time-based penalty gradients
- Whitelisted emergency escapes (no penalty)

Migration Path:
1. Vote on new rate/formula
2. Deploy new contract at new address
3. Provide migration tool for existing vaults
4. Sunset old contract after grace period
*/

// ============================================================================
// PENALTY CALCULATION EXAMPLES FOR DIFFERENT RATES
// ============================================================================

/*
Vault Amount: 1,000,000 STX

Rate   Penalty    User Receives   Summary
-----  ---------------------     -------
5%     50,000     950,000        Liberal emergency access
10%    100,000    900,000        Current (balanced)
15%    150,000    850,000        Stricter savings incentive
20%    200,000    800,000        Very strict discipline
25%    250,000    750,000        Extreme penalty
*/

// ============================================================================
// SECURITY CONSIDERATIONS
// ============================================================================

/*
Penalty Amount Validation:
✓ Always deducted before user amount transfer
✓ Cannot exceed vault balance
✓ Calculation verified in tests
✓ No way to bypass penalty

Penalty Destination Trust:
✓ Only current destination can update address
✓ Prevents unauthorized address changes
✓ Should be multi-sig for production

Contract Upgradability:
✓ If penalty-destination becomes problematic:
  1. Call set-penalty-destination to new address
  2. No contract re-deployment needed
  3. All future penalties go to new address

✓ If penalty rate needs changing:
  1. Deploy new contract with new rate
  2. Migrate vaults to new contract
  3. Old contract can be sunsetted
*/

// ============================================================================
// OPERATIONAL PROCEDURES
// ============================================================================

/*
Daily Operations:
1. Monitor penalty-destination wallet balance
2. Review emergency withdrawal events
3. Check for unusual patterns (cluster of withdrawals)

Weekly Review:
1. Analyze withdrawal rate trends
2. Verify penalty amount accuracy
3. Check destination address validity

Monthly Reporting:
1. Emergency withdrawal statistics
2. Total penalties collected
3. Rate vs. normal withdrawals percentage
4. Governance proposal for rate adjustments if needed

Annual Audit:
1. Verify all penalties correctly accounted
2. Confirm penalty destination legitimacy
3. Propose any contract improvements
4. Review against industry standards
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Problem: Emergency withdrawals with wrong penalty amount

Diagnosis:
- Verify PENALTY_RATE constant in contract
- Check contract was re-deployed after rate change
- Confirm vault balance matches calculation

Solution:
- Check contract version on blockchain
- Audit penalties collected
- Deploy new contract with correct rate

---

Problem: Penalty not being transferred to destination

Diagnosis:
- Check penalty-destination value
- Verify address is valid on Stacks
- Check contract has sufficient balance

Solution:
- Update penalty-destination via set-penalty-destination
- Ensure contract has STX to transfer
- Look for failed transactions in logs

---

Problem: Users upset about penalty amount

Diagnosis:
- Communicate clearly about rate at vault creation
- Show penalty calculation in warning modal
- Provide examples

Solution:
- Governance vote to reduce penalty
- Deploy new contract with new rate
- Offer migration for existing vaults
*/

// ============================================================================
// REGULATORY NOTES
// ============================================================================

/*
The penalty system operates as follows:
- Voluntary feature (users choose emergency withdrawal)
- Transparent calculation (shown before confirmation)
- Non-refundable (no exceptions)
- Protocol-owned (beneficiaries: treasury, insurance, etc.)

Considerations:
- Penalties may be taxable events (jurisdiction dependent)
- Users responsible for tax compliance
- Protocol should document penalty in terms of service
- Clear disclosure in UI (warning modal)
*/

export default {};
