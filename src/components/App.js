import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import brain from '../brain.png'
import CARDS_ARRAY from './Cards';

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.loadContract()

    this.setState({ cardsArray: CARDS_ARRAY.sort(() => 0.5 - Math.random()) })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider installing MetaMask!')
    }
  }

  async loadBlockchainData() {
    const accounts = await window.web3.eth.getAccounts()
    this.setState({
      account: accounts[0]
    })
  }

  async loadContract() {
    const networkId = await window.web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if (networkData) {
      this.loadContractData(networkData)
    } else {
      alert ('Smart contract not deployed to detected network')
    }
  }

  async loadContractData(networkData) {
    const abi = MemoryToken.abi
    const address = networkData.address
    const token = new window.web3.eth.Contract(abi, address)
    this.setState({ token })

    const totalSupply = await token.methods.totalSupply().call()
    this.setState({ totalSupply })

    // Load Tokens
    let balanceOf = await token.methods.balanceOf(this.state.account).call()
    for (let i = 0; i < balanceOf; i++) {
      let id = await token.methods.tokenOfOwnerByIndex(this.state.account, i).call()
      let tokenURI = await token.methods.tokenURI(id).call()
      this.setState({
        tokenURIs: [...this.state.tokenURIs, tokenURI]
      })
    }
  }

  chooseImage = (cardId) => {
    cardId = cardId.toString()
    if (this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png'
    } else if (this.state.cardsChosenId.includes(cardId)) {
      return CARDS_ARRAY[cardId].img
    }

    return window.location.origin + '/images/blank.png'
  }

  flipCard = async (cardId) => {
    let alreadyChosen = this.state.cardsChosen.length

    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardsArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId]
    })

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100)
    }
  }

  checkForMatch = () => {
    const opt1 = this.state.cardsChosenId[0]
    const opt2 = this.state.cardsChosenId[1]

    if (opt1 === opt2) {
      alert ('You have clicked the same image!')
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      this.state.token.methods.mint(
        this.state.account,
        window.location.origin + CARDS_ARRAY[opt1].img.toString()
      )
      .send({from: this.state.account})
      .on('transactionHash', (hash) => {
        this.foundMatch(opt1, opt2)
        this.clearChosen()  
      })
    } else {
      setTimeout(this.clearChosen, 500)
    }
  }

  foundMatch = (opt1, opt2) => {
    this.setState({
      cardsWon: [...this.state.cardsWon, opt1, opt2],
      tokenURIs: [...this.state.tokenURIs, CARDS_ARRAY[opt1].img],
    })
  }

  clearChosen = () => {
    this.setState({
      cardsChosen: [],
      cardsChosenId: []
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardsArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: [],
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.epiccode.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
          <img src={brain} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; Memory Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">Start Matching now!</h1>

                <div className="grid mb-4" >

                  {
                    this.state.cardsArray.map((card, key) => {
                      return (
                        <img
                          key={key}
                          src={this.chooseImage(key)}
                          data-id={key}
                          alt={card.name}
                          onClick={(event) => {
                            let cardId = event.target.getAttribute('data-id')
                            if(!this.state.cardsWon.includes(cardId.toString())) {
                              this.flipCard(cardId)
                            }
                          }}
                        />
                      )
                    })
                  }

                </div>

                <div>

                  <h5>Tokens Collected:<span id="results">&nbsp;{this.state.tokenURIs.length}</span></h5>

                  <div className="grid mb-4" >

                    { this.state.tokenURIs.map((tokenURI, key) => {
                      return (
                        <img key={key} src={tokenURI} alt={key} />
                      )
                    })}

                  </div>

                </div>

              </div>

            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
