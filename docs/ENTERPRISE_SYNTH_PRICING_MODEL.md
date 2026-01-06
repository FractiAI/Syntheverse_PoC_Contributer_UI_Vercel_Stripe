# Enterprise & Creator Sandbox SYNTH Token Pricing Model

**Last Updated**: January 2025  
**Status**: Design & Implementation

---

## Overview

The Enterprise and Creator Sandbox system has been reframed from a Stripe-based subscription model to a **blockchain-native SYNTH token economy**. Sandboxes are now **free to create and test**, with **SYNTH token charges** functioning as "rent" and "energy" costs based on actual sandbox reach and activity.

---

## Core Principles

### 1. Free Sandbox Creation & Testing
- ✅ **No paywall**: Anyone can create and test sandboxes for free
- ✅ **Full functionality**: All features available during testing phase
- ✅ **No time limits**: Test as long as needed before activation

### 2. SYNTH Token Activation
- 🔑 **Activation required**: Pay SYNTH tokens to activate sandbox for production use
- ⚡ **Energy charges**: Ongoing SYNTH costs based on actual usage
- 🏠 **Rent charges**: Base SYNTH costs based on sandbox reach (unique contributors)

### 3. Usage-Based Pricing
- 📊 **Reach metric**: Number of unique contributors to the sandbox
- 🔄 **Activity metric**: Number of submissions, evaluations, and operations
- 💰 **Dynamic costs**: Charges scale with actual ecosystem participation

---

## Pricing Model

### Activation Fee (One-Time)
**Base Activation**: 10,000 SYNTH tokens

This one-time fee activates the sandbox for production use, enabling:
- Public contribution submissions
- On-chain registration
- Full analytics and reporting
- Token allocation system

### Rent Charges (Ongoing - Based on Reach)

**Reach** = Number of unique contributors who have submitted to the sandbox

| Reach Tier | Unique Contributors | Monthly Rent (SYNTH) |
|------------|---------------------|---------------------|
| **Seed** | 1-5 | 1,000 SYNTH/month |
| **Growth** | 6-25 | 5,000 SYNTH/month |
| **Community** | 26-100 | 15,000 SYNTH/month |
| **Ecosystem** | 101-500 | 50,000 SYNTH/month |
| **Metropolis** | 501+ | 100,000 SYNTH/month |

**Rent Calculation**:
- Calculated monthly based on unique contributor count
- Charged at the start of each billing cycle
- Prorated if sandbox is activated mid-cycle

### Energy Charges (Ongoing - Based on Activity)

**Activity** = Operations performed in the sandbox ecosystem

| Activity Type | Energy Cost (SYNTH) |
|--------------|-------------------|
| **Submission Evaluation** | 100 SYNTH per evaluation |
| **On-Chain Registration** | 500 SYNTH per registration |
| **Token Allocation** | 50 SYNTH per allocation |
| **Analytics Query** | 10 SYNTH per query (bulk operations) |

**Energy Calculation**:
- Charged per operation in real-time
- Deducted from sandbox SYNTH balance
- Sandbox pauses if balance insufficient

---

## Sandbox States

### 1. **Testing** (Default)
- ✅ Free to create
- ✅ Full feature access
- ✅ No SYNTH charges
- ⚠️ Submissions are test-only (not counted in reach/activity)
- ⚠️ No on-chain registration
- ⚠️ Limited analytics

### 2. **Activated** (Production)
- ✅ Activated with SYNTH payment
- ✅ Public submissions enabled
- ✅ Full reach and activity tracking
- ✅ On-chain registration available
- ✅ Complete analytics
- ⚡ Ongoing rent + energy charges

### 3. **Paused** (Insufficient Balance)
- ⚠️ Automatically paused if SYNTH balance insufficient
- ⚠️ Submissions blocked
- ✅ Can be reactivated by adding SYNTH tokens
- ✅ Historical data preserved

---

## Reach & Activity Metrics

### Reach Calculation
```typescript
reach = unique_contributors_count
```

**Unique Contributors** = Distinct email addresses who have submitted contributions to the sandbox (excluding test submissions)

**Calculation Frequency**: Updated in real-time when new contributors submit

### Activity Calculation
```typescript
activity = {
  submissions: count_of_evaluations,
  registrations: count_of_on_chain_registrations,
  allocations: count_of_token_allocations,
  analytics_queries: count_of_analytics_operations
}
```

**Activity Tracking**: Real-time tracking of all operations

---

## SYNTH Token Balance Management

### Sandbox Balance
Each sandbox maintains its own SYNTH token balance:
- **Initial**: 0 SYNTH (testing mode)
- **Activation**: User deposits SYNTH tokens to activate
- **Ongoing**: Balance decreases with rent + energy charges
- **Recharge**: Users can add more SYNTH tokens at any time

### Balance Tracking
- **Database**: `enterprise_sandboxes.synth_balance` (numeric, 18 decimals)
- **Blockchain**: Optional on-chain tracking via smart contract
- **Real-time**: Balance updated immediately on charges

### Low Balance Warnings
- **Warning**: < 1,000 SYNTH remaining
- **Critical**: < 100 SYNTH remaining
- **Paused**: < 0 SYNTH (sandbox automatically paused)

---

## Migration from Stripe Model

### Existing Sandboxes
- **Grandfathered**: Existing Stripe subscriptions continue until expiration
- **Migration Path**: After subscription expires, switch to SYNTH model
- **No Data Loss**: All sandbox data preserved

### New Sandboxes
- **Default**: All new sandboxes use SYNTH model
- **No Stripe**: Stripe checkout removed from sandbox creation
- **SYNTH Only**: Activation requires SYNTH token deposit

---

## Implementation Details

### Database Schema Updates
```sql
-- Add SYNTH balance and activation fields
ALTER TABLE enterprise_sandboxes
ADD COLUMN synth_balance NUMERIC(20, 0) DEFAULT 0,
ADD COLUMN synth_activated BOOLEAN DEFAULT FALSE,
ADD COLUMN synth_activated_at TIMESTAMP,
ADD COLUMN synth_activation_fee NUMERIC(20, 0) DEFAULT 10000,
ADD COLUMN current_reach_tier TEXT,
ADD COLUMN last_billing_cycle TIMESTAMP;

-- Track SYNTH transactions
CREATE TABLE sandbox_synth_transactions (
  id TEXT PRIMARY KEY,
  sandbox_id TEXT NOT NULL REFERENCES enterprise_sandboxes(id),
  transaction_type TEXT NOT NULL, -- 'activation', 'deposit', 'rent', 'energy', 'refund'
  amount NUMERIC(20, 0) NOT NULL,
  balance_before NUMERIC(20, 0) NOT NULL,
  balance_after NUMERIC(20, 0) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Track reach and activity metrics
CREATE TABLE sandbox_metrics (
  sandbox_id TEXT PRIMARY KEY REFERENCES enterprise_sandboxes(id),
  unique_contributors INTEGER DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  total_registrations INTEGER DEFAULT 0,
  total_allocations INTEGER DEFAULT 0,
  total_analytics_queries INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### 1. Check SYNTH Balance
```
GET /api/enterprise/sandboxes/[id]/synth-balance
```
Returns current SYNTH balance and activation status

#### 2. Activate Sandbox
```
POST /api/enterprise/sandboxes/[id]/activate
Body: { amount: number }
```
Deposits SYNTH tokens and activates sandbox

#### 3. Deposit SYNTH Tokens
```
POST /api/enterprise/sandboxes/[id]/deposit
Body: { amount: number }
```
Adds SYNTH tokens to sandbox balance

#### 4. Get Usage Metrics
```
GET /api/enterprise/sandboxes/[id]/metrics
```
Returns reach and activity metrics

#### 5. Calculate Charges
```
GET /api/enterprise/sandboxes/[id]/charges
```
Returns projected rent and energy charges

---

## User Experience Flow

### 1. Create Sandbox (Free)
```
User → Create Sandbox → Testing Mode (Free)
```

### 2. Test Sandbox
```
User → Submit Test Contributions → Evaluate → Review Results
(No SYNTH charges, no reach/activity tracking)
```

### 3. Activate Sandbox
```
User → View Activation Requirements → Deposit SYNTH Tokens → Activate
(One-time 10,000 SYNTH activation fee)
```

### 4. Production Use
```
User → Submit Contributions → Real-time SYNTH Charges → Monitor Balance
(Rent: Monthly based on reach | Energy: Per-operation)
```

### 5. Manage Balance
```
User → View Balance → Add SYNTH Tokens → Monitor Charges
(Recharge anytime, automatic pause if insufficient)
```

---

## Benefits of SYNTH Model

### For Creators & Enterprises
- ✅ **No upfront costs**: Test before committing
- ✅ **Pay for value**: Charges based on actual usage
- ✅ **Blockchain-native**: Aligned with Syntheverse ecosystem
- ✅ **Transparent**: All charges visible and predictable
- ✅ **Scalable**: Costs scale with success

### For Syntheverse Ecosystem
- ✅ **Token utility**: SYNTH tokens have real utility
- ✅ **Economic alignment**: Sandbox success = SYNTH demand
- ✅ **Decentralized**: No Stripe dependency
- ✅ **Sustainable**: Usage-based model prevents waste

---

## Future Enhancements

### Phase 2: On-Chain SYNTH Integration
- Direct blockchain SYNTH token transfers
- Smart contract-based activation
- Automated rent/energy charges via smart contracts

### Phase 3: SYNTH Staking
- Stake SYNTH tokens for reduced rates
- Staking tiers with benefits
- Yield generation from staked tokens

### Phase 4: Cross-Sandbox Economics
- SYNTH token transfers between sandboxes
- Sandbox-to-sandbox collaboration incentives
- Ecosystem-wide SYNTH liquidity

---

## Summary

The new SYNTH token-based pricing model transforms enterprise and creator sandboxes from a subscription-based service to a **blockchain-native, usage-based economy**. By removing paywalls and implementing rent + energy charges based on actual reach and activity, we create a more aligned, transparent, and scalable system that benefits both creators and the Syntheverse ecosystem.

**Key Changes**:
- ❌ Removed: Stripe subscriptions, per-submission fees, paywalls
- ✅ Added: Free testing, SYNTH activation, usage-based charges
- 🎯 Result: Blockchain-native, transparent, scalable pricing

