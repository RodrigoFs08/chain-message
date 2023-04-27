import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";


export default function App() {
  
  const logo="https://tokenizadora.com.br/wp-content/uploads/2023/02/logo-qr-tokenizadora.svg"
  const contractAddress = "0x32f552C61ddD3b6e97d9B0D4006134d886246F8E";
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  const contractABI = abi.abi;

/*
   * Método para guardar a mensagem do usuario na variavel userMessage
   */
  const handleInputChange = (e) => {
  setUserMessage(e.target.value);
};
    /*
   * Método para consultar todos os tchauzinhos do contrato
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Chama o método getAllWaves do seu contrato inteligente
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * Apenas precisamos do endereço, data/horário, e mensagem na nossa tela, então vamos selecioná-los
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Armazenando os dados
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Objeto Ethereum não existe!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Garanta que possua a Metamask instalada!");
        return;
      } else {
        console.log("Temos o objeto ethereum", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Encontrada a conta autorizada:", account);
        setCurrentAccount(account)
      } else {
        console.log("Nenhuma conta autorizada foi encontrada")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implemente aqui o seu método connectWallet
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("MetaMask não encontrada!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Conectado", accounts[0]);
      
      setCurrentAccount(accounts[0]);

      if (ethereum) {
        getAllWaves();
        return;
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves()
  }, [])

  const wave = async (message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de mensagens...", count.toNumber());

        /*
        * Executar o tchauzinho a partir do contrato inteligente
        */
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Minerando...", waveTxn.hash);
        
        setUserMessage("")

        await waveTxn.wait();
        console.log("Minerado -- ", waveTxn.hash);
        

        count = await wavePortalContract.getTotalWaves();
        console.log("Total de mensagens recuperado...", count.toNumber());
      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
  <div className="mainContainer">

    <div className="dataContainer">
      <div className="header">
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "300px", display: "block", margin: "0 auto" }} />
      </div>

      <div className="bio">
        Esse é um smart contract que grava a mensagem do usuario na blockchain Testnet Sepolia ETH. É necessário possuir um metamask conectada na rede Sepolia ETH.
      </div>
      <div>
        <input
          type="text"
          value={userMessage}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem aqui"
          style={{ width: "100%", padding: "12px 20px", margin: "8px 0", boxSizing: "border-box" }}
        />
      </div>

      <button className="waveButton" onClick={() => wave(userMessage)}>
        Mandar Mensagem
      </button>
      {/* * Se não existir currentAccount, apresente este botão */}
      {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Conectar carteira
        </button>
      )}

      {allWaves.slice().reverse().map((wave, index) => {
  return (
    <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
      <div>Endereço: {wave.address}</div>
      <div>Data/Horário: {wave.timestamp.toString()}</div>
      <div>Mensagem: {wave.message}</div>
    </div>)
})}

    </div>
    
  </div>
)}
