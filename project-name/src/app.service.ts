import {HttpException, Injectable} from '@nestjs/common';
import {timeStamp} from 'console';
import {ethers} from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/Ballot.json';
import {ConfigService} from '@nestjs/config';

const TOKENIZED_VOTES_ADDRESS = "0x2f78d7476869d3057ce137f8e38f3a8b24244c4e";
const TEST_MINT_VALUE = ethers.utils.parseEther("10");
const PROPOSALS = ["Mexico", "Argentina", "Brasil"];

@Injectable()export class AppService {
    provider : ethers.providers.Provider;
    voter : ethers.Wallet;

    constructor(private configService : ConfigService) {
        this.provider = ethers.getDefaultProvider('goerli');
        let wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", this.provider);
        this.voter = wallet.connect(this.provider);
    }

    async getTokenAddress() {
        return {result: TOKENIZED_VOTES_ADDRESS};
    }

    async claimTokens(address : string) {
        let contract = new ethers.Contract(TOKENIZED_VOTES_ADDRESS, tokenJson.abi, this.voter);

        const mitTx = await contract.mint(address, TEST_MINT_VALUE);
        await mitTx.wait();

        let voterTokenBalance = await contract.balanceOf(address);
        console.log("voter token balance after mint:", voterTokenBalance.toString());

        return {result: voterTokenBalance.toString()};
    }
    

    async deployBallot(address : string) {
        let ballotContractFactory = new ethers.ContractFactory(ballotJson.abi, ballotJson.bytecode, this.voter);
        const latestBlock = await this.provider.getBlock("latest")
        let ballotContract = await ballotContractFactory.deploy(convertStringArrayToBytes32(PROPOSALS),address, latestBlock.number + 100);
        await ballotContract.deployed();
        console.log("Ballot deployed to:", ballotContract.address);
    
    }
}

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
        bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}
