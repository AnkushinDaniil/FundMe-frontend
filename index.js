import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "MetaMask is connected"
        // const accounts = await ethereum.request({ method: "eth_accounts" })
        // console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        const provider = new ethers.BrowserProvider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            console.log(`Current balance is ${ethers.formatEther(balance)} ETH`)
        } catch (error) {
            console.log(error)
        }
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with amount ${ethAmount} ETH`)
    if (typeof window.ethereum !== "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" })
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    console.log(signer)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        const transactionResponse = await contract.fund({
            value: ethers.parseEther(ethAmount),
        })
        await listenForTransactionMined(transactionResponse, provider)
        console.log("Transaction is done")
    } catch (error) {
        console.log(error)
    }
}

async function withdraw() {
    console.log("Withdrawing...")
    if (typeof window.ethereum !== "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" })
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    console.log(signer)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        const transactionResponse = await contract.withdraw()
        await listenForTransactionMined(transactionResponse, provider)
        console.log("The funds have been withdrawn")
    } catch (error) {
        console.log(error)
    }
}

function listenForTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(
                transactionResponse.hash,
                async (transactionReceipt) => {
                    const confirmations =
                        await transactionReceipt.confirmations()
                    console.log(
                        `Completed with ${confirmations} confirmations. `,
                    )
                    resolve()
                },
            )
        } catch (error) {
            reject(error)
        }
    })
}
