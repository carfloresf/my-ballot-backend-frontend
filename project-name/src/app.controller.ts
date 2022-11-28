import {Body, Controller, Get, Param, Query, Post
}from '@nestjs/common';
import {
    AppService
}from './app.service';

export class ClaimTokensDto {
   address: string;
}

export class DeployBallotDto {
    address: string;
 }

@Controller() export class AppController {
    constructor(private readonly appService: AppService) {}
    

   @Get('token-address') getTokenAddress() {
        return this.appService.getTokenAddress();
   }

    @Post('claim-tokens') 
    claimPaymentOrder(@Body() body: ClaimTokensDto) {
        return this.appService.claimTokens(body.address);
    }

    @Post('deploy-ballot')
    deployBallot(@Body() body: DeployBallotDto) {
        return this.appService.deployBallot(body.address);
    }

    /*
    @Post('delegate')
    delegateAddress(@Body() body: ClaimTokensDto) {
        return this.appService.delegateAddress(body.address);
    }   
    */
}
