"use client";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="w-full"
                    variant="outline"
                    size="lg"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size="lg"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex gap-3">
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    size="sm"
                  >
                    {" "}
                    <span className="flex items-center cursor-pointer mr-2">
                      {chain.hasIcon && chain.iconUrl && (
                        <span
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: "hidden",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 4,
                          }}
                        >
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        </span>
                      )}
                    </span>
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}