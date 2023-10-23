import _ from 'lodash-es';
import { table } from 'table';

import { ChainArtifacts } from '@usecannon/builder';

export function printChainBuilderOutput(output: ChainArtifacts) {
  if (output.contracts) {
    const formattedData = _.map(output.contracts, (v, k) => [k, v.address]);

    if (formattedData.length) {
      console.log('');
      console.log('CONTRACTS:');
      console.log(table(formattedData));
    }
  }

  if (output.txns) {
    const formattedData = _.map(output.txns, (v, k) => [k, v.hash]);

    if (formattedData.length) {
      console.log('');
      console.log('TRANSACTIONS:');
      console.log(table(formattedData));
    }
  }

  if (output.extras) {
    const formattedData = _.map(output.extras, (v, k) => [k, v]);

    if (formattedData.length) {
      console.log('');
      console.log('EXTRA DATA:');
      console.log(table(formattedData));
    }
  }
}
