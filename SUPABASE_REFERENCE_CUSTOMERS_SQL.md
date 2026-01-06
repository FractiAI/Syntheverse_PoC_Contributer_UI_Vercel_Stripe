# Supabase SQL: Reference Customers Query

## Overview

No migration needed! The reference customer feature uses the existing `metadata` JSONB column in the `enterprise_sandboxes` table. All reference customer data is stored in the metadata field.

---

## Test Query: View Reference Customers

Run this in Supabase SQL Editor to see all reference customers:

```sql
-- View all reference customers
SELECT 
  id,
  name,
  description,
  operator,
  synth_activated_at,
  created_at,
  (metadata->>'reference_customer')::boolean as is_reference,
  (metadata->>'activation_discount_applied')::boolean as discount_applied,
  (metadata->>'activation_discount_percent')::numeric as discount_percent,
  (metadata->>'base_activation_fee')::numeric as base_fee,
  (metadata->>'final_activation_fee')::numeric as final_fee
FROM enterprise_sandboxes
WHERE (metadata->>'reference_customer')::boolean = true
ORDER BY synth_activated_at DESC;
```

---

## Verify Metadata Structure

Check if any sandboxes have reference customer metadata:

```sql
-- Check metadata structure for reference customers
SELECT 
  id,
  name,
  operator,
  metadata->'reference_customer' as reference_flag,
  metadata->'activation_discount_applied' as discount_flag,
  metadata->'activation_discount_percent' as discount_percent
FROM enterprise_sandboxes
WHERE metadata ? 'reference_customer'
ORDER BY created_at DESC;
```

---

## Optional: Create Index for Performance

If you expect many reference customers, you can create an index to speed up queries:

```sql
-- Create GIN index on metadata for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_enterprise_sandboxes_metadata_reference 
ON enterprise_sandboxes 
USING GIN (metadata jsonb_path_ops);

-- Or create a partial index specifically for reference customers
CREATE INDEX IF NOT EXISTS idx_enterprise_sandboxes_reference_customers
ON enterprise_sandboxes ((metadata->>'reference_customer'))
WHERE (metadata->>'reference_customer')::boolean = true;
```

---

## Count Reference Customers

Quick count query:

```sql
-- Count total reference customers
SELECT COUNT(*) as total_reference_customers
FROM enterprise_sandboxes
WHERE (metadata->>'reference_customer')::boolean = true;
```

---

## View Reference Customer Details with Discount Info

Detailed view with all discount information:

```sql
-- Detailed reference customer view
SELECT 
  id as sandbox_id,
  name as sandbox_name,
  description,
  operator as operator_email,
  synth_activated_at,
  created_at,
  CASE 
    WHEN (metadata->>'reference_customer')::boolean = true THEN 'Yes'
    ELSE 'No'
  END as is_reference_customer,
  CASE 
    WHEN (metadata->>'activation_discount_applied')::boolean = true THEN 'Yes'
    ELSE 'No'
  END as discount_applied,
  COALESCE((metadata->>'activation_discount_percent')::numeric, 0) as discount_percent,
  COALESCE((metadata->>'base_activation_fee')::numeric, 0) as base_activation_fee,
  COALESCE((metadata->>'final_activation_fee')::numeric, 0) as final_activation_fee,
  COALESCE((metadata->>'base_activation_fee')::numeric, 0) - 
  COALESCE((metadata->>'final_activation_fee')::numeric, 0) as discount_amount
FROM enterprise_sandboxes
WHERE (metadata->>'reference_customer')::boolean = true
ORDER BY synth_activated_at DESC;
```

---

## Notes

- **No migration required**: All data is stored in the existing `metadata` JSONB column
- **Automatic tracking**: When a customer activates with `agree_to_reference: true`, the system automatically:
  - Applies 5% discount to activation fee
  - Stores `reference_customer: true` in metadata
  - Records discount details (percent, base fee, final fee)
- **Query performance**: The optional indexes above will speed up queries if you have many sandboxes

---

## Testing

After a customer activates with the reference option, you can verify it worked:

```sql
-- Check the most recently activated sandbox
SELECT 
  name,
  operator,
  synth_activated_at,
  metadata->'reference_customer' as is_reference,
  metadata->'activation_discount_percent' as discount
FROM enterprise_sandboxes
WHERE synth_activated_at IS NOT NULL
ORDER BY synth_activated_at DESC
LIMIT 5;
```

