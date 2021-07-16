import { useEffect, useState } from 'react';
import { Raiden } from 'raiden-ts';

import './App.css';
import logo from './assets/logo.svg';

const TOKEN_ADDRESS = '0xC563388e2e2fdD422166eD5E76971D11eD37A466'
const PARTNER_ADDRESS = '0xC01E19cEee7B4Fe80eD53Cf31b095aDd4b863C53'

function App() {
  const [raiden, setRaiden] = useState();
  const [channelWithPartner, setChannelWithPartner] = useState();
  const [openChannelInProgress, setOpenChannelInProgress] = useState(false);
  const [transferHistory, setTransferHistory] = useState({});
  const [transferAmountInput, setTransferAmountInput] = useState();
  const [transferInProgress, setTransferInProgress] = useState(false);

  const onChannelsUpdate = (channelDictionary) => {
    const channelWithPartner = channelDictionary[TOKEN_ADDRESS]?.[PARTNER_ADDRESS];
    setChannelWithPartner(channelWithPartner);
  }

  // TODO: handle transfer events

  const connect = async () => {
    if (!raiden) {
      const subscriptions = [];
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const raiden = await Raiden.create(window.ethereum, 0, undefined, undefined, undefined, true);
      subscriptions.push(raiden.channels$.subscribe(onChannelsUpdate));
      // TODO: subscribe to transfer events
      await raiden.start();
      await raiden.synced;
      setRaiden(raiden);

      return async () => {
        subscriptions.forEach(subscription => subscription.unsubscribe());
        await raiden.stop();
      }
    }
  }

  const openNewChannel = async () => {
    setOpenChannelInProgress(true);
    await raiden.mint(TOKEN_ADDRESS, 20);
    await raiden.openChannel(TOKEN_ADDRESS, PARTNER_ADDRESS, { deposit: 20 });
    setOpenChannelInProgress(false);
  }

  // TODO: transfer to partner function

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
                {channelWithPartner?.capacity?.toString() ?? '0'} TTW
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
                placeholder="Amount TTW"
                onChange={event => setTransferAmountInput(event.target.value)}
                disabled={!channelWithPartner || transferInProgress}
              />
              <button
                className={transferInProgress ? 'loading' : ''}
                // TODO: handle clicks
                disabled={!channelWithPartner || transferInProgress}
              >
                Transfer
              </button>
            </div>

            <div className="app__box app__transfer-history">
              <h1 className="app__box__title">History</h1>
              {Object.keys(transferHistory).length > 0 ? (
                Object.values(transferHistory).sort(
                  (a, b) => b.changedAt.getTime() - a.changedAt.getTime()
                ).map(transfer =>
                  <div
                    key={transfer.key}
                    className="app__transfer-history__entry"
                  >
                    <span>{transfer.value.toString()} TTW</span>
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
