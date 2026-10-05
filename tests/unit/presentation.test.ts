import {describe,it,expect} from 'vitest';
import {transactionAmounts} from '../../src/components/transaction-presentation';
describe('transaction amount display',()=>{
 it('preserves minor units beyond JavaScript safe integers',()=>{
  expect(transactionAmounts([{financial_event_id:'one',amount_minor:'9007199254740993'},{financial_event_id:'one',amount_minor:'17'}]).get('one')).toBe(9007199254741010n);
 });
 it('keeps separately posted events separate',()=>{
  const amounts=transactionAmounts([{financial_event_id:'purchase',amount_minor:'620000'},{financial_event_id:'payment',amount_minor:'400000'}]);
  expect(amounts.get('purchase')).toBe(620000n);
  expect(amounts.get('payment')).toBe(400000n);
 });
});
