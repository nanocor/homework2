import { MyERC20Contract, StudentSocietyDAOContract } from '../utils/contracts'
import { message } from 'antd'



const addpropsal = async (name: string, duration: number, account: any, getUserInformation: any, consultAllProposal: any) => {
  console.log(account)
  if (StudentSocietyDAOContract) {
    await  MyERC20Contract.methods.approve(StudentSocietyDAOContract.options.address, 20).send({from: account})

    StudentSocietyDAOContract.methods
      .addpropsal(name, duration)
      .send({from: account,gas: '10000'})

      .then((result: any) => {
        console.log(result)
        message.success('提出提案')
        getUserInformation()
        consultAllProposal()
      })

      .catch((err: any) => {message.error('请先处理上一个提案')})
  }
}


const VoteY = async (id: number, account: number, getUserInformation: any, consultAllProposal: any) => {
  if (StudentSocietyDAOContract) {
    await  MyERC20Contract.methods.approve(StudentSocietyDAOContract.options.address, 5).send({from: account})

    console.log('同意')
    StudentSocietyDAOContract.methods
      .VoteY(id)
      .send({from: account,gas: '10000'})
      .then((result: any) => {
        console.log(result)
        getUserInformation()
        consultAllProposal()
        message.success('投票成功')
      })
      .catch((err: any) => {message.error(err + '')})
  }
}

const VoteN = async (id: number, account: number, getUserInformation: any, consultAllProposal: any) => {
  if (StudentSocietyDAOContract) {
    await  MyERC20Contract.methods.approve(StudentSocietyDAOContract.options.address, 5).send({from: account})

    StudentSocietyDAOContract.methods
      .VoteN(id)
      .send({from: account})
      .then((result: any) => {
        console.log(result)
        getUserInformation()
        consultAllProposal()
        message.success('投票成功')
      })
      .catch((err: any) => {message.error(err + '')})
  }
}

const Bonus = async (account: number, getUserInformation: any) => {
  if (StudentSocietyDAOContract) {
    StudentSocietyDAOContract.methods
      .Bonus()
      .send({from: account})
      
      .then((result: any) => {
        console.log(result)
        getUserInformation()
        message.success('领取成功')
      })
      .catch((err: any) => {
        message.error('未获得奖励')
      })
  }
}



export { VoteY, VoteN, Bonus, addpropsal}
