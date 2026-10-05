# Seed Data Specification

Create useful local/demo seed data.

## Demo projects

### Project 1
Name: Project Aurora
Code: AURORA-01
Currency: INR
Opening funding: ₹150,000

Funding:
- Institute Grant ₹100,000
- Team Contribution ₹25,000
- Sponsor ₹25,000

Budget:
- Electronics ₹60,000
- Mechanical ₹40,000
- Travel ₹20,000
- Registration ₹10,000
- Reserve ₹20,000

### Project 2
Name: Weather Node
Code: WXNODE
Currency: INR
Opening funding: ₹50,000

## Demo members

Use generic names, not real user data:
- Alex Kumar — OWNER
- Maya Joseph — FINANCE_MANAGER
- Rahul Nair — MEMBER
- Tina George — APPROVER

If local Supabase Auth seeding requires special handling, document mapping and provide a deterministic dev bootstrap.

## Demo vendors

- ElectroHub
- MakerSupply
- ProtoFab
- CloudHost

## Demo Project Aurora transactions

1. Funding received ₹100,000
2. Funding received ₹25,000
3. Funding received ₹25,000
4. Project-paid flight controller purchase ₹32,450
5. Rahul personally pays motors ₹6,200
6. Partial reimbursement to Rahul ₹4,000
7. Bill from ProtoFab ₹12,400, unpaid
8. Purchase request for batteries estimated ₹9,000, approved
9. Actual battery purchase ₹8,600
10. Refund ₹600 against one purchase
11. Advance ₹10,000 to Maya
12. Advance expense ₹7,150
13. Advance return ₹2,850

## Demo assets

- Flight Controller
- Camera Module

## Demo documents

Insert metadata examples.
Actual binary sample files are optional; UI should handle no-file dev rows gracefully.

## Purpose

The seed data should demonstrate:
- balance
- member reimbursement
- bill outstanding
- budget use
- approval
- advance
- asset
- refund
- dashboard charts
