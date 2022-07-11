## Avoiding Common Attacks
### Use Specific Compiler Pragma
Used a specific compiler version `pragma solidity 0.8.0` which has overflow checks and SafeMath built in.  

### Use Modifiers Only for Validation
hasFunds
  - validates user's account balance has sufficient funds for withdraw amount
  
isHodler
  - validates a user has held a deposit in the bank for a specified length of time before rewarding with Galleon ERC20 tokens

### Re-entrancy Guard
nonReentrant functions
  - deposit
  - withdraw (wei)
  - transfer ERC20 tokens to user
  