import { useEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import {
  useActivateAccountLazyQuery,
  useActivationAddressQuery,
  useActivationKeyNonceQuery,
} from "src/generated/graphql";
import { useIsHeadlessAvailable } from "./useIsHeadlessAvailable";
import { useStore } from "./useStore";

interface ActivationResult {
  loading: boolean;
  error: boolean;
  activated: boolean;
}

/**
 * A helper hook which has two jobs to do.
 * 1. It queries the activation status of the current account.
 * 2. When the activationKey is provided, it will stage a transaction to activate the account.
 *
 * @param activationKey An activation key to use for automatic activation. Pass `undefined` to disable automatic activation.
 * @returns {ActivationResult} A object with two properties: `loading` and `activated`. They are pretty self-explanatory.
 */
export function useActivation(activationKey?: string): ActivationResult {
  const account = useStore("account");
  const isAvailable = useIsHeadlessAvailable();
  const [isPolling, setPolling] = useState(false);
  const [txError, setTxError] = useState<Error | undefined>();
  const { loading, data, error } = useActivationAddressQuery({
    variables: {
      address: account.address,
    },
    pollInterval: isPolling ? 1000 : undefined,
    skip: !account.isLogin,
  });

  const {
    loading: nonceLoading,
    data: nonceData,
    error: nonceError,
  } = useActivationKeyNonceQuery({
    variables: {
      // @ts-expect-error The query will not run if activationKey is undefined due to the skip option.
      encodedActivationKey: activationKey,
    },
    skip: !activationKey,
  });
  const [tx] = useActivateAccountLazyQuery();

  useEffect(() => {
    if (nonceData?.activated) {
      setTxError(new Error("Already activated."));
      return;
    }
    if (
      !data?.activationStatus.addressActivated &&
      activationKey &&
      nonceData?.activationKeyNonce &&
      !isPolling
    ) {
      unstable_batchedUpdates(() => {
        setPolling(true);
        setTxError(undefined);
      });
      account
        .getPublicKeyString()
        .then((v) =>
          tx({
            variables: {
              publicKey: v,
              activationCode: activationKey,
            },
          })
        )
        .catch((e) => {
          setTxError(e);
          console.error(e);
        })
        .then(() => setPolling(false));
    }
  }, [activationKey, tx, nonceData, isPolling]);

  useEffect(() => {
    if (data?.activationStatus.addressActivated) setPolling(false);
  }, [data]);

  return {
    loading: loading || nonceLoading || !isAvailable,
    error: Boolean(txError || error || nonceError),
    activated: data?.activationStatus.addressActivated ?? false,
  };
}