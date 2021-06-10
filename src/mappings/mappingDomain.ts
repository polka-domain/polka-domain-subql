import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { AccountId, Balance, BlockNumber } from '@polkadot/types/interfaces/runtime';
import type {Bytes} from '@polkadot/types';
import {hexToUtf8} from '../helpers/common'
import { Domain } from "../types/models/Domain";


//Self::deposit_event(Event::DomainRegistered(who, domain, ethereum, deposit));
export async function domainRegisterEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [who_origin, domain_origin, ethereum_origin, deposit_origin] } } = event;
    
    const who = (who_origin as AccountId).toString();
    const domain = hexToUtf8(domain_origin as Bytes);
    const ethereum = hexToUtf8(ethereum_origin as Bytes);
    const deposit = (deposit_origin as Balance).toBigInt();

    let record = new Domain((domain_origin as Bytes).toString())
    record.domain = domain;
    record.ownerId = who;
    record.ethereum = ethereum;
    record.registered = true;
    record.deposit = deposit;

    await record.save();
}

//Self::deposit_event(Event::DomainDeregistered(who, domain));
export async function domainDeregisterEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [who_origin, domain_origin] } } = event;

    const domain = (domain_origin as Bytes).toString();
    let record = await Domain.get(domain);
    if (record) {
        record.registered = false;
        await record.save();
    }
}