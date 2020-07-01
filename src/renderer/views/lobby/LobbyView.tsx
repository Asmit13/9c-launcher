import * as React from "react";
import { LinearProgress } from "@material-ui/core";
import { RPC_LOOPBACK_HOST, RPC_SERVER_PORT } from "../../../config";
import { IStoreContainer } from "../../../interfaces/store";
import { inject, observer } from "mobx-react";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";

const LobbyView = observer((props: IStoreContainer) => {
  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();
  const { accountStore, routerStore, gameStore } = props;

  return (
    <div>
      <label>
        {gameStore.isGameStarted ? "Now Running..." : "Running the game"}
      </label>
      <br />
      <br />
      {nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded ? (
        <button
          disabled={gameStore.isGameStarted}
          onClick={(event: React.MouseEvent) => {
            gameStore.startGame(
              accountStore.privateKey,
              true,
              RPC_LOOPBACK_HOST,
              RPC_SERVER_PORT
            );
          }}
        >
          Start Game
        </button>
      ) : (
        <>
          <LinearProgress />
          <p>Preload Status</p>
          <p>
            {preloadProgressSubscriptionResult?.preloadProgress?.extra.type}{" "}
            {
              preloadProgressSubscriptionResult?.preloadProgress?.extra
                .currentCount
            }{" "}
            /{" "}
            {
              preloadProgressSubscriptionResult?.preloadProgress?.extra
                .totalCount
            }
          </p>
        </>
      )}
    </div>
  );
});

export default inject("accountStore", "routerStore", "gameStore")(LobbyView);
