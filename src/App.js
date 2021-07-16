import logo from './assets/logo.svg';
import './App.css';
import { Raiden } from 'raiden-ts';
import { useEffect, useState } from 'react';

const TOKEN_ADDRESS = '0xC563388e2e2fdD422166eD5E76971D11eD37A466'
const PARTNER_ADDRESS = '0xee0f8e9A79cC3789AEba5A6CE16b21275924A618'

function App() {
  const [raiden, setRaiden] = useState();
  const [channelWithPartner, setChannelWithPartner] = useState();
  const [openChannelInProgress, setOpenChannelInProgress] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [transferAmountInput, setTransferAmountInput] = useState();
  const [transferInProgress, setTransferInProgress] = useState(false);

  const onChannelsUpdate = (channelDictionary) => {
    const channelWithPartner = channelDictionary[TOKEN_ADDRESS]?.[PARTNER_ADDRESS];
    setChannelWithPartner(channelWithPartner);
  }

  const onTransfersUpdate = (transfer) => {
    if (transfer.completed) {
      setTransferHistory([...transferHistory, transfer])
    }
  }

  async function connect() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const raiden = await Raiden.create(window.ethereum, 0, undefined, undefined, undefined, true);
    raiden.channels$.subscribe(onChannelsUpdate);
    raiden.transfers$.subscribe(onTransfersUpdate);
    await raiden.start();
    await raiden.synced;
    setRaiden(raiden);
  }

  const openNewChannel = async () => {
    setOpenChannelInProgress(true);
    await raiden.mint(TOKEN_ADDRESS, '10');
    await raiden.openChannel(TOKEN_ADDRESS, PARTNER_ADDRESS, { deposit: '1' });
    setOpenChannelInProgress(false);
  }

  const transferToPartner = async () => {
    setTransferInProgress(true)
    await raiden.transfer(TOKEN_ADDRESS, PARTNER_ADDRESS, transferAmountInput);
    setTransferInProgress(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => connect(), []);

  return (
    <>
      {raiden
        ? (
          <div className="app">
            <h1 className="app__title">Raiden EthCC Demo</h1>

            <div className="app__box app__channel-status">
              <h1 className="app__box__title">Channel</h1>
              <span className="app__channel-status__capacity">
                {channelWithPartner?.capacity?.toString() ?? '0'} TTT
              </span>
              <button
                disabled={channelWithPartner || openChannelInProgress}
                className={openChannelInProgress ? 'loading' : ''}
                onClick={openNewChannel}
              >
                Open Channel
              </button>
            </div>

            <div className="app__box app__transfer-inputs">
              <h1 className="app__box__title">Transfer</h1>
              <input
                value={transferAmountInput}
                placeholder="Amount TTT"
                onChange={event => setTransferAmountInput(event.target.value)}
              />
              <button
                disabled={!channelWithPartner || transferInProgress}
                className={transferInProgress ? 'loading' : ''}
                onClick={transferToPartner}
              >
                Transfer
              </button>
            </div>

            <div className="app__box app__transfer-history">
              <h1 className="app__box__title">History</h1>
              {transferHistory.length > 0 ? (
                transferHistory.map(transfer =>
                  <div
                    key={transfer.key}
                    className="app__transfer-history__entry"
                  >
                    <span>{transfer.value.toString()} TTT</span>
                    <span>{transfer.changedAt.toLocaleString()}</span>
                  </div>
                )
              ) : (
                <div className="app__transfer-history__placeholder">
                  No Transfers
                </div>
              )}
            </div>
          </div>
        ) : (<img src={logo} className="logo" alt="logo" />)
      }
    </>
  )
}

export default App;
