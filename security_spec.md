# Security Specification for Lumina Library

## 1. Data Invariants
- A user profile can only be created by the authenticated owner.
- A book can only be added or modified by an authenticated staff/admin.
- Activity logs are append-only (create only, no delete/update by clients typically, but here we allow staff).
- Sensitive user data (PII) is restricted to the owner.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a user profile for a different UID.
2. **Key Injection**: Attempt to add `isAdmin: true` to a user profile.
3. **Ghost Update**: Attempt to update a book with an extra field `isFree: true`.
4. **ID Poisoning**: Use a 2KB string as a book ID.
5. **PII Leak**: Non-owner attempts to read a private email field.
6. **Query Scraping**: Attempt to list all users without an ownerId filter.
7. **Type Mismatch**: Try to update `year` (integer) with a string.
8. **Resource Exhaustion**: Send a 1MB string in the `title` field.
9. **Orphaned Write**: Create a book with a non-existent `category`.
10. **State Skipping**: Move a book from 'Available' to 'Missing' without proper role.
11. **Time Spoofing**: Provide a manual client timestamp for `updatedAt`.
12. **Immutable Field Attack**: Try to change `createdAt` on a user profile.

## 3. Test Runner
I will create `firestore.rules.test.ts` to verify these.
