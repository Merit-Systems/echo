'use client';

import { AppGroupNotFound } from '../../_components/error/not-found';

export default function AppNotFound() {
  return (
    <AppGroupNotFound
      title="App Not Found"
      description="The app you are looking for does not exist."
    />
  );
}
