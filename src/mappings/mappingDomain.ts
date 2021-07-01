import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { AccountId, Balance, BlockNumber } from '@polkadot/types/interfaces/runtime';
import type { Bytes, u32, u64 } from '@polkadot/types';
import {hexToUtf8} from '../helpers/common';
import { Domain } from "../types/models/Domain";
import type { ITuple } from '@polkadot/types/types';
import type { ClassId } from '@polkadot/types/interfaces/uniques';
import type { TokenId } from 'domain-types/src/interfaces/types';
import { NFT } from "../types";


//Self::deposit_event(Event::DomainRegistered(who, domain, ethereum, deposit, (T::NftClassID::get(), token_id.into())  ));
export async function domainRegisterEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [who_origin, domain_origin, ethereum_origin, deposit_origin, token0_origin] } } = event;
    
    const who = (who_origin as AccountId).toString();
    const domain = hexToUtf8(domain_origin as Bytes);
    const ethereum = hexToUtf8(ethereum_origin as Bytes);
    const deposit = (deposit_origin as Balance).toBigInt();
    const token0 = token0_origin as ITuple<[ClassId, TokenId]>;

    let record = new Domain((domain_origin as Bytes).toString())
    record.domain = domain;
    record.ownerId = who;
    record.ethereum = ethereum;
    record.registered = true;
    record.deposit = deposit;

    await record.save();

    //save nft with domain
    let domainInfo = await Domain.get((domain_origin as Bytes).toString());

    if (domainInfo) {
        let nft = new NFT(token0.toString())
        nft.classId = (token0[0] as u32).toNumber()
        nft.tokenId = (token0[1] as u64).toNumber()
        nft.domainInfoId = domainInfo.id;
        await nft.save();
    }
}

//Self::deposit_event(Event::DomainDeregistered(who, domain, (T::NftClassID::get(), token_id.into())));
export async function domainDeregisterEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [who_origin, domain_origin] } } = event;

    const domain = (domain_origin as Bytes).toString();
    let record = await Domain.get(domain);
    if (record) {
        record.registered = false;
        await record.save();
    }
}