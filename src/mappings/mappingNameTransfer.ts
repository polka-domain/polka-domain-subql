import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { AccountId, Balance, BlockNumber } from '@polkadot/types/interfaces/runtime';
import type { Compact} from '@polkadot/types';
import {hexToUtf8} from '../helpers/common'
import { NameTransfer } from "../types/models/NameTransfer";
import { AccountHandler } from '../handlers/sub-handlers/account';

export async function nameTransferEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [from_origin, to_origin, amount_origin] } } = event;
    const from = (from_origin as AccountId).toString();
    const to = (to_origin as AccountId).toString();
    const amount = (amount_origin as Balance).toBigInt();

    await AccountHandler.ensureAccount(from)
    await AccountHandler.ensureAccount(to)
    const blockNumber = (event.extrinsic.block.block.header.number as Compact<BlockNumber>).toNumber();

    let record = new NameTransfer(blockNumber.toString() + '-' + event.idx.toString());
    record.fromId = from;
    record.toId = to;
    record.amount = amount;
    record.timestamp = event.block.timestamp;

    await record.save();
}