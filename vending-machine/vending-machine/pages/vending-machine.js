import Head from 'next/head'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import vendingMachineContract from '../blockchain/vending'
import 'bulma/css/bulma.css'
import styles from '../styles/VendingMachine.module.css'

const VendingMachine = () => {
  const [error, setError] = useState('')
  const [successMsg, setSuccesMsg] = useState('')
  const [inventory, setInventory] = useState('')
  const [myDonutCount, setmyDonutCount] = useState('')
  const [buyCount, setBuyCount] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [vmContract, setVmContract] = useState(null)
  const [purchases, setPurchases] = useState(0)

  useEffect(() =>{
    
    if (vmContract) getInventoryHandler()
    if (vmContract && address) getMyDonutCountHandler()
  }, [vmContract, address, purchases])

  const getInventoryHandler = async () => {
    const inventory = await vmContract.methods.getVendingMachineBalance().call()
    setInventory(inventory)
  }

  const getMyDonutCountHandler = async () => {
    
    //it's going to return an array with metamask accts, an position 0 will be the acct conected.
    const count = await vmContract.methods.donutBalances(address).call()
    setmyDonutCount(count)
  }
  const updateDonutQty = event => {
    setBuyCount(event.target.value)
  }

  const buyDonutHandler = async () => {
    try{
      await vmContract.methods.purchase(buyCount).send({
        from: address,
        value: web3.utils.toWei('2','ether')*buyCount
      }),
      setSuccesMsg(`${buyCount} donuts purchased!`)
      
        if (vmContract) getInventoryHandler()
        if (vmContract && address) getMyDonutCountHandler()
      }catch(err){
      setError(err.message)
    } 
  }

  //window.ethereum only works if the user has metamask installed
  const connectWalletHandler = async () => {
    /* check if MetaMask is available */
      if(typeof window !== "undefined" && typeof window.ethereum !==  "undefined"){
        try {
          /* reqiest wallet connect */
          await window.ethereum.request({method: "eth_requestAccounts"})
          /*set web3 instance*/
          web3 = new Web3(window.ethereum)
          setWeb3(web3)
          /*get a list of current accounts that are connected to the wallet*/
          const accounts = await web3.eth.getAccounts()
          setAddress(address)

          /* create local contract copy*/ 
          const vm = vendingMachineContract(web3)
          setVmContract(vm)

        } catch(err) {
           setError(err.message)
        }
        
      } else {
        //meta not installed
        console.log("Please install metamask")
      }
  }  

  return (
    <div className={styles.main}>
      <Head>
        <title >   Vending Machine Dapp</title>
        <meta  name="description" content="   A blockchain vending machine app" />
      </Head>
      <nav className="navbar m-5 "> 
        <div className="container">
            <div className="navbar-brand">
              <h1> Vending Machine</h1>
            </div>
            <div className="navbar-end">
                <button onClick={connectWalletHandler} className="button is-primary"> Connect Wallet </button>
            </div>
        </div>
      </nav>
      <section>
        <div className="container">
            <p>Vending Machine Inventory: {inventory}</p> 
        </div>
      </section>
      <section>
        <div className="container">
            <h2> My donuts: {myDonutCount}</h2>
        </div>
      </section>
      <section className='m-5'>
        <div className="container">
            <div className="field">
              <label className="label"> Buy donuts</label>
              <div className="control">
                <input onChange={updateDonutQty} className="input" type="type" placeholder="Enter amount..." />
              </div>
              <button onClick={buyDonutHandler} className="button is-primary mt-2"> Buy </button>
            </div>
        </div>
      </section>
      <section>
        <div className="container has-text-danger">
            <p>{error}</p> 
        </div>
      </section>
      <section>
        <div className="container has-text-success">
            <p>{successMsg}</p> 
        </div>
      </section>
    </div>
  )
}

export default VendingMachine