## Design Patterns

### Inheritance and Interfaces
Gringotts.sol uses the IERC20 interface to interact with Galleons.sol ERC20 tokens  
### Access Control Design Patterns
onlyOwner
 - can mint Galleon ERC20 tokens
 - can pause/unpause the Galleon.sol contract
 - can allocate Galleon ERC20 token to the contract to spend on their behalf
 - can pause/unpause the Gringotts.sol contract
  
### Gas Optimizations
- Enabled gas optimization in truffle-config, used external instead of public functions where possible
- Declared external functions instead of public where possible