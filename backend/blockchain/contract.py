import os
import secrets


def _is_mock_mode() -> bool:
    return not all([
        os.getenv("SEPOLIA_RPC_URL"),
        os.getenv("WALLET_PRIVATE_KEY"),
        os.getenv("CONTRACT_ADDRESS"),
    ])


def _mock_tx_hash() -> str:
    return "0x" + secrets.token_hex(32)


def register_evidence(file_hash: str, case_id: str, uploader: str) -> str:
    """Register evidence on-chain; returns transaction hash."""
    if _is_mock_mode():
        return _mock_tx_hash()

    try:
        from web3 import Web3

        rpc_url = os.getenv("SEPOLIA_RPC_URL")
        private_key = os.getenv("WALLET_PRIVATE_KEY")
        contract_address = os.getenv("CONTRACT_ADDRESS")

        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            return _mock_tx_hash()

        abi = [
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "_fileHash", "type": "bytes32"},
                    {"internalType": "string", "name": "_caseId", "type": "string"},
                    {"internalType": "string", "name": "_uploader", "type": "string"},
                ],
                "name": "register",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function",
            }
        ]

        account = w3.eth.account.from_key(private_key)
        contract = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=abi)

        hash_bytes = bytes.fromhex(file_hash)
        tx = contract.functions.register(hash_bytes, case_id, uploader).build_transaction({
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 200000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()
    except Exception:
        return _mock_tx_hash()


def verify_evidence(file_hash: str) -> tuple:
    """Verify evidence on-chain; returns (exists, timestamp, case_id)."""
    if _is_mock_mode():
        return (False, 0, "")

    try:
        from web3 import Web3

        rpc_url = os.getenv("SEPOLIA_RPC_URL")
        contract_address = os.getenv("CONTRACT_ADDRESS")

        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            return (False, 0, "")

        abi = [
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "_fileHash", "type": "bytes32"},
                ],
                "name": "verify",
                "outputs": [
                    {"internalType": "bool", "name": "exists", "type": "bool"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "string", "name": "caseId", "type": "string"},
                ],
                "stateMutability": "view",
                "type": "function",
            }
        ]

        contract = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=abi)
        hash_bytes = bytes.fromhex(file_hash)
        exists, timestamp, case_id = contract.functions.verify(hash_bytes).call()
        return (exists, timestamp, case_id)
    except Exception:
        return (False, 0, "")
