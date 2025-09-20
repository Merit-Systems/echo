"use client";

import { Button } from "@/components/ui/button";

export default function InstallGithubAppButton() {
  return (
    <Button asChild>
      <a href="/api/github/install">Install GitHub App</a>
    </Button>
  );
}
