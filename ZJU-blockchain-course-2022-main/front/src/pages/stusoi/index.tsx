import { Input, Button, Modal, Card, List, message } from 'antd'
import { useState, useEffect } from 'react'
import { VoteY, VoteN, Bonus,addpropsal } from '../../assets/function'
import { StudentSocietyDAOContract, web3 ,MyERC20Contract} from '../../utils/contracts'

import './index.css'

const GanacheTestChainId = '0x1691'
const GanacheTestChainName = 'Localhost7545'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'

const getTime = (time: number) => {
  time = 1000*time 
  const date = new Date(time)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

let myAccount: number = 0

const DemoPage = () => {
  const [list, setList] = useState<any[] | undefined>([])
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState(0)
  const [inputString, setInputString] = useState('')
  const [inputNumber, setInputNumber] = useState(0)
  const [token, setToken] = useState(0)
  const [remainTime, setRemainTime] = useState(10)
  const [info, setInfo] = useState<any>(undefined)
  useEffect(() => {
    let timer: any

    console.log(myAccount)
    if (myAccount !== 0) {
      StudentSocietyDAOContract.once(
        'TokenList',
        {fromBlock: 0},
        (err: any, res: any) => {
          if (!err) {getUserInformation()}
          console.log(err, res)
        }
      )

      timer = setInterval(() => {
        setRemainTime(prev => {
          if (prev <= 0) {
            if (myAccount !== 0) {
              consultProposal()
              setRemainTime(10)
            }
            return 10
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      clearInterval(timer)
    }
  }, [myAccount])

  const onClickConnectWallet = async () => {
    // @ts-ignore
    const { ethereum } = window;
    if (!Boolean(ethereum && ethereum.isMetaMask)) {
      alert('MetaMask is not installed!');
      return
    }

    try {
      if (ethereum.chainId !== GanacheTestChainId) {
        const chain = {
          chainId: GanacheTestChainId, // Chain-ID
          chainName: GanacheTestChainName, // Chain-Name
          rpcUrls: [GanacheTestChainRpcUrl] // RPC-URL
        }

        try {
          await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chain.chainId }] })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain] })
          }
        }
      }

      await ethereum.request({ method: 'eth_requestAccounts' })

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      setAccount(accounts[0])
      myAccount = accounts[0]
    } catch (error: any) {
      message.error(error + '')
    }
  }



  const login = async (id: number) => {
    const accounts = await web3.eth.getAccounts()
    if (accounts.length === 0) {
      alert('?????????')
      return
    }
    setAccount(accounts[id])
    myAccount = accounts[id]
    console.log(accounts)
    if (StudentSocietyDAOContract) {

      StudentSocietyDAOContract.methods
        .login()
        .send({
          from: accounts[id]
        })
        .then((res: any) => {
          getUserInformation()
          consultProposal()
          message.success('????????????')
        })
        .catch((err: any) => {
          message.error('????????????')
        })
    }
  }

  const getUserInformation = async () => {
    const accounts = await web3.eth.getAccounts()
    if (accounts.length === 0) {
      message.error('??????????????????')
      return
    }
    const result = await MyERC20Contract.methods.balanceOf(myAccount).call()
    const data = await StudentSocietyDAOContract.methods.students(myAccount).call()
    console.log(result, data)
    setToken(result)
    setInfo(data)
  }


  const consultProposal = async () => {
    const accounts = await web3.eth.getAccounts()
    if (accounts.length === 0) {
      message.error('??????????????????')
      return
    }
    if (StudentSocietyDAOContract) {
      const len = await StudentSocietyDAOContract.methods.propid().call()
      console.log('????????????', len)
      const res = []
      const start = len - 5 > 0 ? len - 5 : 1

      for (let i = start; i < len; i++) {
        await StudentSocietyDAOContract.methods.check(i).send({
          from: accounts[0],
          gas: '200000'
        })
        const result = await StudentSocietyDAOContract.methods.proposals(i).call()
        res.push(result)
      }
      console.log(res)
      res.reverse()
      setList([...res])
    }
  }

  return (
    <Card className="userBox">
      {myAccount !== 0 ? (
        <>
          <h3>???????????????{account}</h3>
          <Button onClick={async () => {login(0)}}>
            ??????1
          </Button>

          <Button onClick={async () => {login(1)}}>
           ??????2
          </Button>
          <h3>???????????????{token} tokens</h3>
          <h3>????????????????????????{info?.success}</h3>

          <div className="functionBox">
            <Button onClick={() => setOpen(true)}>????????????(5 tokens)</Button>
            <Button onClick={() => {Bonus(myAccount, getUserInformation)}}>
              ????????????
            </Button>
          </div>
          <br />
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={list}
            renderItem={item => {
              return (
                <Card title={item.name}>
                  <p>??????id: {item.index}</p>
                  <p>????????????: {getTime(parseInt(item.startTime))}</p>
                  <p>????????????: {item.duration}s</p>
                  <p>????????????: {item.finish ? (item.result > 0 ? '????????????' : '???????????????') : '????????????'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Button onClick={() => VoteY(item.index, myAccount, getUserInformation, consultProposal)}>??????(1 token)</Button>
                    <Button onClick={() => VoteN(item.index, myAccount, getUserInformation, consultProposal)}>??????(1 token)</Button>
                  </div>
                </Card>
              )
            }}
          />
        </>
      ) : (
        <>
          <h3>?????????????????????????????????????????????</h3>
          <Button
            onClick={async () => {await onClickConnectWallet()
              login(0)
            }}
          >
            ????????????
          </Button>
        </>
      )}
      {open ? (
        <Modal
          open
          onOk={async () => {
            addpropsal(inputString, inputNumber, myAccount, getUserInformation, consultProposal)
            setOpen(false)
          }}
          onCancel={() => {
            setOpen(false)
          }}
        >
          <Input
            onBlur={e => {
              setInputString(e.target.defaultValue)
            }}
            style={{ width: 'calc(100% - 200px)' }}
            placeholder="????????????"
          />
          <br />
          <br />
          <Input
            onBlur={e => {setInputNumber(parseInt(e.target.defaultValue))}}
            type="number"
            style={{ width: 'calc(100% - 200px)' }}
            placeholder="????????????(s)"
          />
        </Modal>
      ) : (
        ''
      )}
    </Card>
  )
}

export default DemoPage
