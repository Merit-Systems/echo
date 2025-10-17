"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useEcho } from "@merit-systems/echo-next-sdk/client";

export default function BalanceWidget() {
  const echo = useEcho();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    echo.balance
      .getBalance()
      .then((b) => {
        if (!mounted) return;
        setBalance(b.balance);
      })
      .catch(() => {
        if (!mounted) return;
        setBalance(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [echo]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {loading ? "Loading..." : `Balance: $${balance?.toFixed(2) ?? "--"}`}
      </span>
      <Button variant="outline" onClick={() => signOut()}>
        Sign Out
      </Button>
    </div>
  );
}
