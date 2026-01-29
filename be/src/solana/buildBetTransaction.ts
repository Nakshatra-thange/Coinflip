import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
  } from "@solana/web3.js"
  
  /**
   * Build a coin flip bet settlement transaction.
   *
   * @param connection Solana connection
   * @param userPubkey User wallet public key (string or PublicKey)
   * @param housePubkey House wallet public key (string or PublicKey)
   * @param betAmountSol Bet amount in SOL (number)
   * @param won Whether user won (boolean)
   *
   * @returns Transaction (unsigned, ready for wallet signing)
   */
  export async function buildBetTransaction(params: {
    connection: Connection
    userPubkey: string | PublicKey
    housePubkey: string | PublicKey
    betAmountSol: number
    won: boolean
  }) {
    const { connection, betAmountSol, won } = params
  
    const user =
      typeof params.userPubkey === "string"
        ? new PublicKey(params.userPubkey)
        : params.userPubkey
  
    const house =
      typeof params.housePubkey === "string"
        ? new PublicKey(params.housePubkey)
        : params.housePubkey
  
    const lamports = Math.floor(betAmountSol * 1_000_000_000)
  
    const tx = new Transaction()
  
    /**
     * LOSS FLOW
     * User → House (bet amount)
     */
    if (!won) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: user,
          toPubkey: house,
          lamports,
        })
      )
    }
  
    /**
     * WIN FLOW
     * 1️⃣ User → House (bet)
     * 2️⃣ House → User (2x payout)
     */
    if (won) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: user,
          toPubkey: house,
          lamports,
        })
      )
  
      tx.add(
        SystemProgram.transfer({
          fromPubkey: house,
          toPubkey: user,
          lamports: lamports * 2,
        })
      )
    }
  
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash()
  
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
  
    tx.feePayer = user
  
    return tx
  }
  