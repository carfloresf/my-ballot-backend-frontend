import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ethers} from 'ethers';
import tokenJson from '../assets/MyToken.json';
import ballotJson from '../assets/Ballot.json';

@Component({selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.scss']})
export class AppComponent {
    provider : ethers.providers.Provider;
    wallet : ethers.Wallet | undefined;
    tokenContract : ethers.Contract | undefined;
    etherBalance : number | undefined;
    tokenBalance : number | undefined;
    claimedTokens : number | undefined;
    votePower : number | undefined;
    tokenAddress : string | undefined;
    ballotContract : ethers.Contract | undefined;
    proposals: string[] = [];  
    selfDelegated: boolean |undefined ;


    constructor(private http : HttpClient) {
        this.provider = ethers.providers.getDefaultProvider('goerli');
    }


    createWallet() {
        this.http.get<any>('http://localhost:3000/token-address').subscribe((ans) => {
            this.tokenAddress = ans.result;

            if (this.tokenAddress) {
                console.log(this.tokenAddress);

                this.wallet = ethers.Wallet.createRandom().connect(this.provider);
                console.log(this.wallet);
                this.tokenContract = new ethers.Contract(this.tokenAddress, tokenJson.abi, this.wallet);

                this.getBalances();     
            }
        });
    }

    getBalances() {
        this.wallet!.getBalance().then((balanceBN : ethers.BigNumberish) => {
            this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN));
        });
        this.tokenContract!["balanceOf"](this.wallet!.address).then((balanceBN : ethers.BigNumberish) => {
            this.tokenBalance = parseFloat(ethers.utils.formatEther(balanceBN));
        });
        this.tokenContract!["getVotes"](this.wallet!.address).then((votesBN : ethers.BigNumberish) => {
            this.votePower = parseFloat(ethers.utils.formatEther(votesBN));
        });
    }

  
    connectWallet(privateKey : string) {
        this.http.get<any>('http://localhost:3000/token-address').subscribe((ans) => {
            this.tokenAddress = ans.result;

            if (this.tokenAddress) {
                const wallet1 = new ethers.Wallet(privateKey, this.provider);
                this.wallet = wallet1.connect(this.provider);
                this.tokenContract = new ethers.Contract(this.tokenAddress, tokenJson.abi, this.wallet);

                this.getBalances();
            }
        });
    }

    claimTokens() {
        this.http.post<any>('http://localhost:3000/claim-tokens', {
            address: this.wallet ?. address
        }).subscribe((ans) => {
            console.log({ans});
            const txHash = ans.result;
            this.provider.getTransaction(txHash).then((tx) => {
                tx.wait().then((receipt) => {
                    this.tokenContract = new ethers.Contract(this.tokenAddress !, tokenJson.abi, this.wallet);
                    console.log(receipt);
                    this.getBalances();
                })
            })
        });
    }

    connectBallot(ballotaddress : string) { 
        console.log(ballotaddress);
        this.ballotContract = new ethers.Contract(ballotaddress, ballotJson.abi, this.wallet);
        this.ballotContract!["proposals"](0).then((info0 : any) => {
            console.log(ethers.utils.parseBytes32String(info0[0].toString()));
            this.proposals.push(ethers.utils.parseBytes32String(info0[0].toString()));
        });
        this.ballotContract!["proposals"](1).then((info1: any) => {
            this.proposals.push(ethers.utils.parseBytes32String(info1[0].toString()));

            console.log(ethers.utils.parseBytes32String(info1[0].toString()));
        });
        this.ballotContract!["proposals"](2).then((info2 : any) => {
            console.log(ethers.utils.parseBytes32String(info2[0].toString()));
            this.proposals.push(ethers.utils.parseBytes32String(info2[0].toString()));
        });
    }

    delegate(delegateAddress : string) {}

    castVote(proposal:string,numberOfVotes:string) {
        console.log("vote for proposal: " + proposal + " with " + numberOfVotes + " votes");
        this.ballotContract!["vote"](proposal,ethers.utils.parseEther(numberOfVotes),{gasLimit: 1000000}).then((info : any) => {
            console.log(info);
        });
    }

    async selfDelegate() {
        console.log("delegateAddress", this.wallet ?. address);

        const delegateTx = await this.tokenContract ?. ["delegate"](this.wallet?.address).then((tx:any) => {
            tx.wait().then((receipt:any) => { // TODO: optional

                console.log(receipt);
                this.selfDelegated = true;
            })
        })
        return {result: delegateTx};
    }
}