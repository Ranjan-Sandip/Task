import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

const nUSD_ADDRESS = "YOUR_NUSD_CONTRACT_ADDRESS"; // Replace with your deployed nUSD contract address

function App() {
  const [ethAmount, setEthAmount] = useState("");
  const [nusdAmount, setNusdAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");

  const handleDeposit = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(nUSD_ADDRESS, nusdABI, signer);

      const weiAmount = ethers.utils.parseEther(ethAmount);
      const tx = await contract.deposit(weiAmount);
      await tx.wait();

      setEthAmount("");
      setNusdAmount("");
    } catch (error) {
      console.error("Error depositing ETH:", error);
    }
  };

  const handleRedeem = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(nUSD_ADDRESS, nusdABI, signer);

      const nusdAmountWei = ethers.utils.parseUnits(nusdAmount, 18);
      const tx = await contract.redeem(nusdAmountWei);
      await tx.wait();

      setNusdAmount("");
      setRedeemAmount("");
    } catch (error) {
      console.error("Error redeeming nUSD:", error);
    }
  };

  const handleGetETHPrice = async () => {
    try {
      const response = await axios.get("https://api.your-eth-price-oracle-url.com");
      const ethPrice = response.data.price;
      const nusdAmount = (ethAmount / ethPrice).toFixed(4);
      setNusdAmount(nusdAmount);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
    }
  };

  return (
    <div>
      <h1>nUSD Stablecoin</h1>
      <div>
        <label>ETH Amount:</label>
        <input type="text" value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} />
        <button onClick={handleGetETHPrice}>Get nUSD Amount</button>
        <br />
        <label>nUSD Amount:</label>
        <input type="text" value={nusdAmount} readOnly />
        <button onClick={handleDeposit}>Deposit</button>
      </div>
      <div>
        <label>nUSD Amount to Redeem:</label>
        <input type="text" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} />
        <button onClick={handleRedeem}>Redeem</button>
      </div>
    </div>
  );
}

export default App;
