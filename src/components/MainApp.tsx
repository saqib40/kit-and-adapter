// src/components/MainApp.tsx
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

export const MainApp = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState<number>(0);

    // 1. Fetch balance when publicKey changes
    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then(lamports => {
                setBalance(lamports / LAMPORTS_PER_SOL);
            });
        }
    }, [publicKey, connection]);

    // 2. Airdrop SOL
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

    // 3. Send SOL
    const handleSendSol = async () => {
        if (!publicKey) return;
        try {
            // A fixed address for testing - replace with an input field in a real app
            const recipientAddress = 'RecipientPublicKeyGoesHere';
            const recipientPublicKey = new PublicKey(recipientAddress);

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
            alert('Transaction successful!');
        } catch (error) {
            console.error(error);
            alert('Transaction failed!');
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h1>My Solana dApp 🛠️</h1>
            
            {/* The wallet connect button */}
            <WalletMultiButton />

            {/* Conditionally render content after wallet connection */}
            {publicKey ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <h3>Wallet Connected!</h3>
                    <p>Your address: {publicKey.toBase58()}</p>
                    <p>Balance: {balance.toFixed(4)} SOL</p>
                    <button onClick={handleAirdrop}>Airdrop 1 SOL</button>
                    <button onClick={handleSendSol}>Send 0.1 SOL (to fixed address)</button>
                </div>
            ) : (
                <p>Please connect your wallet to get started.</p>
            )}
        </div>
    );
};