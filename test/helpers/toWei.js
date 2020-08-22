export default function toWei (n) {
  return new web3.BigNumber(web3.utils.toWei(n, 'ether'));
}
