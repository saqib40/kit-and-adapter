import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

export const MainApp = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState<number>(0);
    const [recipient, setRecipient] = useState<string>('');

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then(lamports => {
                setBalance(lamports / LAMPORTS_PER_SOL);
            });
        }
    }, [publicKey, connection]);

    const handleAirdrop = async () => {
        if (!publicKey) return;
        try {
            const airdropSignature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
            await connection.confirmTransaction(airdropSignature);
            const newBalance = await connection.getBalance(publicKey);
            setBalance(newBalance / LAMPORTS_PER_SOL);
            alert('Airdrop successful!');
        } catch (error) {
            console.error(error);
            alert('Airdrop failed!');
        }
    };

    const handleSendSol = async () => {
        if (!publicKey || !recipient) {
            alert('Please enter a recipient address!');
            return;
        }

        try {
            const recipientPublicKey = new PublicKey(recipient);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: 0.1 * LAMPORTS_PER_SOL, // Send 0.1 SOL
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');

            const newBalance = await connection.getBalance(publicKey);
            setBalance(newBalance / LAMPORTS_PER_SOL);
            setRecipient(''); // Clear the input field after sending
            alert('Transaction successful!');
        } catch (error) {
            console.error('Transaction failed:', error);
            // Handle invalid address error specifically
            if (error instanceof Error && error.message.includes('Invalid public key')) {
                alert('Invalid recipient address. Please enter a valid Solana public key.');
            } else {
                alert('Transaction failed!');
            }
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h1>My Solana dApp 🛠️</h1>
            
            <WalletMultiButton />

            {publicKey ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <h3>Wallet Connected!</h3>
                    <p>Your address: {publicKey.toBase58()}</p>
                    <p>Balance: {balance.toFixed(4)} SOL</p>
                    <button onClick={handleAirdrop}>Airdrop 1 SOL</button>
                    
                    <hr style={{width: '100%'}}/>

                    <h4>Send SOL</h4>
                    {/* 3. Input field for the recipient's address */}
                    <input
                        type="text"
                        placeholder="Enter recipient's address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        style={{ width: '400px', padding: '8px', textAlign: 'center' }}
                    />
                    <button onClick={handleSendSol}>Send 0.1 SOL</button>
                </div>
            ) : (
                <p>Please connect your wallet to get started.</p>
            )}
        </div>
    );
};