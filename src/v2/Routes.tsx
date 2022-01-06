import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router";
import type { ProtectedPrivateKey } from "src/main/headless/key-store";
import { useStore } from "./utils/useStore";

import LoginView from "./views/LoginView";
import WelcomeView from "./views/WelcomeView";
import RegisterView from "./views/RegisterView";
import LobbyView from "./views/LobbyView";
import MissingActivationView from "./views/MissingActivationView";
import ImportView from "./views/ImportView";
import RecoverView from "./views/RecoverView";

const Redirector = observer(() => {
  const account = useStore("account");
  const history = useHistory();

  useEffect(() => {
    const protectedPrivateKeys: ProtectedPrivateKey[] = ipcRenderer.sendSync(
      "get-protected-private-keys"
    );
    if (protectedPrivateKeys.length < 1) {
      history.replace("/welcome");
    } else {
      protectedPrivateKeys.filter(Boolean).map(({ address }) => {
        account.addresses.includes(address)
          ? null
          : account.addAddress(address);
      });

      history.replace("/login");
    }
  });

  return null;
});

export default function Routes() {
  return (
    <Switch>
      <Route path="/login" component={LoginView} />
      <Route path="/welcome" component={WelcomeView} />
      <Route
        path="/register/missing-activation"
        component={MissingActivationView}
      />
      <Route path="/register" component={RegisterView} />
      <Route path="/lobby" component={LobbyView} />
      <Route path="/import" component={ImportView} />
      <Route path="/recover" component={RecoverView} />
      <Route exact path="/" component={Redirector} />
      <Redirect from="*" to="/" />
    </Switch>
  );
}
