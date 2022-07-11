import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";

import Loader from "react-loader-spinner";

import Web3 from "web3";
import tpbank from "./abis/TPBank.json";
import thepeoplestoken from "./abis/ThePeoplesToken.json";

import metamask from "./images/metamask.png";
import eth from "./images/bnb-logo.png";
import galleon from "./images/logowhite.png";
// import logo from "./images/logo.png";

const App = () => {
  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
  const expectedBlockTime = 1000;
  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const tpbankAddress = "0x475EfCeEA42c24E2608b56F08e70Ca939B7249c4";
  const tpbankABI = tpbank.abi;
  const tpbankContract = new web3.eth.Contract(tpbankABI, tpbankAddress);

  const thepeoplestokenAddress = "0xB6651E4E9D3280E7FB3Ee59139953a18d15715A9";
  const thepeoplestokenABI = thepeoplestoken.abi;
  const thepeoplestokenContract = new web3.eth.Contract(
    thepeoplestokenABI,
    thepeoplestokenAddress
  );

  const [currentAccount, setCurrentAccount] = useState("");
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [depositValue, setDepositValue] = useState("");
  const [withdrawValue, setWithdrawValue] = useState("");
  const [rewards, setRewards] = useState(0);
  const [available, setAvailable] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isPending, setPending] = useState(false);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("You need a MetaMask wallet to connect.");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      setCurrentAccount(accounts[0]);
      setConnected(true);

      const ethBalance = await tpbankContract.methods
        .getWeiBalance()
        .call({ from: accounts[0] });
      setBalance(web3.utils.fromWei(ethBalance, "ether"));

      const userThePeoplesTokenBalance = await thepeoplestokenContract.methods
        .balanceOf(accounts[0])
        .call()
        .then((bal) => bal);
      setRewards(web3.utils.fromWei(userThePeoplesTokenBalance, "ether"));
    } catch (error) {
      console.log(error);
    }
  };

  const makeDeposit = async () => {
    try {
      let ethBalance;
      const amount = web3.utils.toWei(depositValue, "ether");
      await tpbankContract.methods
        .deposit()
        .send(
          { from: currentAccount, value: amount.toString(), gasLimit: 300000 },
          async function (error, transactonHash) {
            console.log("Submitted transaction with hash: ", transactonHash);
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              // Waiting expectedBlockTime until the transaction is mined
              transactionReceipt = await web3.eth.getTransactionReceipt(
                transactonHash
              );
              setLoading(true);
              await sleep(expectedBlockTime);
            }
            console.log("Transaction receipt: ", transactionReceipt);
            ethBalance = await tpbankContract.methods
              .getWeiBalance()
              .call({ from: currentAccount });
            setBalance(web3.utils.fromWei(ethBalance, "ether"));
            setDepositValue("");
            setAvailable(true);
            setLoading();
          }
        );
    } catch (error) {
      console.log(error);
    }
  };

  const makeWithdrawal = async () => {
    try {
      const amount = web3.utils.toWei(withdrawValue, "ether");
      let bal = await tpbankContract.methods
        .getWeiBalance()
        .call({ from: currentAccount });

      if (bal < amount) {
        alert("insufficient funds");
        setWithdrawValue("");
      } else {
        await tpbankContract.methods
          .withdraw(amount)
          .send({ from: currentAccount }, async function (
            error,
            transactonHash
          ) {
            console.log("Submitted transaction with hash: ", transactonHash);
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              // Waiting expectedBlockTime until the transaction is mined
              transactionReceipt = await web3.eth.getTransactionReceipt(
                transactonHash
              );
              setLoading(true);
              await sleep(expectedBlockTime);
            }
            console.log("Transaction receipt: ", transactionReceipt);
            bal = await tpbankContract.methods
              .getWeiBalance()
              .call({ from: currentAccount });
            setBalance(web3.utils.fromWei(bal, "ether"));
            setWithdrawValue("");
            setLoading();
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const claim = async () => {
    try {
      let userThePeoplesTokenBalance = await thepeoplestokenContract.methods
        .balanceOf(currentAccount)
        .call()
        .then((bal) => bal);
      userThePeoplesTokenBalance = web3.utils.fromWei(
        userThePeoplesTokenBalance.toString(),
        "ether"
      );

      if (parseInt(userThePeoplesTokenBalance, 10) >= 1000) {
        alert("User has already claimed their rewards for this year");
        setAvailable(false);
        return;
      } else {
        await tpbankContract.methods
          .mintThePeoplesTokenToUser(currentAccount)
          .send({ from: currentAccount }, async function (
            error,
            transactonHash
          ) {
            console.log("Submitted transaction with hash: ", transactonHash);
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              // Waiting expectedBlockTime until the transaction is mined
              transactionReceipt = await web3.eth.getTransactionReceipt(
                transactonHash
              );
              setPending(true);
              await sleep(expectedBlockTime);
            }
            console.log("Transaction receipt: ", transactionReceipt);
            userThePeoplesTokenBalance = await thepeoplestokenContract.methods
              .balanceOf(currentAccount)
              .call()
              .then((bal) => bal);
            setRewards(web3.utils.fromWei(userThePeoplesTokenBalance, "ether"));
            setPending();
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container className="p-3">
      <Container>
        <Row className="align-items-sm-center mb-5">
          <Col sm={{ span: 6 }}>
            <Navbar>
              <Container>
                <Navbar.Brand href="#home">
                  <span id="title">ThePeoplesBank</span>
                </Navbar.Brand>
              </Container>
            </Navbar>
          </Col>
          <Col sm={{ span: 3, offset: 3 }}>
            <Button
              id="connectBtn"
              style={{ width: "14rem" }}
              onClick={connectWallet}
            >
              {" "}
              <img src={metamask} height="32" alt="Metamask Logo" />
              {currentAccount
                ? ` ${currentAccount.slice(0, 6)}......${currentAccount.slice(
                    currentAccount.length - 4,
                    currentAccount.length
                  )}`
                : "Connect to BSCTestNet"}
            </Button>
          </Col>
        </Row>
        <Row className="justify-content-sm-center mb-3 text-center">
          <Col sm={{ span: 6 }}>
            <span id="description">
              To make deposits and withdrawals, please connect your Metamask
              Wallet to the Rinkeby network. You will need some test ETH as
              well. Try the official{" "}
              <a href="https://faucet.rinkeby.io/">Rinkeby Faucet</a>.
            </span>
          </Col>
        </Row>
        <Row className="justify-content-sm-center">
          <Col sm={12}>
            {isLoading ? (
              <Card
                className="m-auto mb-3 text-center p-3"
                style={{ width: "32rem" }}
              >
                <Loader
                  type="Oval"
                  color="#734b6d"
                  height={80}
                  width={80}
                  timeout={15000} //3 secs
                />
              </Card>
            ) : (
              <Card
                className="m-auto mb-3 text-center p-3"
                style={{ width: "32rem" }}
                text="light"
              >
                <Card.Header>
                  <Card.Title>Account Balance</Card.Title>
                </Card.Header>
                <Card.Body>
                  {balance} BNB <img src={eth} height="32" alt="Ether Logo" />
                </Card.Body>
                <InputGroup className="mb-2 p-2">
                  <FormControl
                    placeholder="Amount (BNB)"
                    aria-label="Amount (BNB)"
                    aria-describedby="basic-addon2"
                    value={depositValue}
                    onChange={(e) => setDepositValue(e.target.value)}
                  />
                  <Button
                    id="primary"
                    style={{ width: "8rem" }}
                    onClick={makeDeposit}
                    disabled={!connected}
                  >
                    Deposit
                  </Button>
                </InputGroup>
                <InputGroup className="mb-2 p-2">
                  <FormControl
                    placeholder="Amount (BNB)"
                    aria-label="Amount (BNB)"
                    aria-describedby="basic-addon2"
                    value={withdrawValue}
                    onChange={(e) => setWithdrawValue(e.target.value)}
                  />
                  <Button
                    variant="dark"
                    id="button-addon2"
                    style={{ width: "8rem" }}
                    disabled={!(balance > 0)}
                    onClick={makeWithdrawal}
                  >
                    Withdraw
                  </Button>
                </InputGroup>
              </Card>
            )}
          </Col>
        </Row>
        <Row className="justify-content-sm-center">
          <Col sm={12}>
            {isPending ? (
              <Card
                className="m-auto mb-2 text-center  p-3"
                style={{ width: "32rem" }}
                text="light"
              >
                <Loader
                  type="Oval"
                  color="#734b6d"
                  height={80}
                  width={80}
                  timeout={18000} //3 secs
                />
              </Card>
            ) : (
              <Card
                className="m-auto mb-3 text-center  p-3"
                style={{ width: "32rem" }}
                text="light"
              >
                <Card.Header>
                  <Card.Title>Rewards</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    {rewards} ThePeoplesToken{" "}
                    <img src={galleon} height="32" alt="Galleons Logo" />
                  </Card.Text>
                  <Button
                    className="mb-3"
                    id="primary"
                    // id="button-addon2"
                    size="lg"
                    disabled={!available}
                    onClick={claim}
                  >
                    {!available && rewards === 0
                      ? "Deposit to Earn Rewards"
                      : !available && rewards === "1000"
                      ? "Claimed"
                      : "Claim Rewards"}
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      <div id="notice">
        <p>
          To display $TPT in MetaMask open the extension and go to the Assets
          tab. Select import token then copy and paste the TPT token address:
        </p>
        <p>0xB6651E4E9D3280E7FB3Ee59139953a18d15715A9</p>
      </div>
    </Container>
  );
};

export default App;
