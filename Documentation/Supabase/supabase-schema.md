# Supabase Database Schema

This document outlines the schema of tables in the public schema of the BH Project Supabase database.

## Tables Overview

The database contains the following tables in the public schema:
- `category` - Categories for transactions and merchants
- `merchant` - Merchant information
- `transaction_sources` - Sources of transactions
- `transactions` - Transaction records

## Table Details

### Category Table

Stores categories for transactions and merchants.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | no | gen_random_uuid() | Primary key |
| created_at | timestamp with time zone | no | now() | Creation timestamp |
| title | text | no | - | Category title (unique) |

### Merchant Table

Stores merchant information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | no | gen_random_uuid() | Primary key |
| created_at | timestamp with time zone | no | now() | Creation timestamp |
| name | text | no | - | Merchant name (unique) |
| category_id | uuid | yes | - | Reference to category (foreign key) |

### Transaction Sources Table

Defines sources for transactions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint | no | - | Primary key (auto-increment) |
| title | text | no | - | Source title (unique) |

### Transactions Table

Stores transaction records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | no | gen_random_uuid() | Primary key |
| created_at | timestamp with time zone | no | now() | Creation timestamp |
| transaction_date | date | no | - | Date of transaction |
| post_date | date | yes | - | Date transaction was posted |
| description | text | no | - | Transaction description |
| type | text | no | - | Transaction type |
| amount | double precision | no | - | Transaction amount |
| merchant_id | uuid | yes | - | Reference to merchant (foreign key) |
| category_id | uuid | yes | - | Reference to category (foreign key) |
| source | bigint | no | - | Reference to transaction source (foreign key) |
| purchased_by | text | no | - | Person who made the purchase |
| user_id | uuid | no | - | User ID associated with transaction |

## Relationships

### Foreign Keys

1. `transactions.category_id` → `category.id`
2. `merchant.category_id` → `category.id`
3. `transactions.merchant_id` → `merchant.id`
4. `transactions.source` → `transaction_sources.id`

## Row-Level Security (RLS)

All tables have Row-Level Security enabled:
- `category`: RLS enabled
- `merchant`: RLS enabled
- `transaction_sources`: RLS enabled
- `transactions`: RLS enabled 