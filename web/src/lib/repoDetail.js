import { createContext, useContext } from "react";

// Shared by RepoDetailProvider (which renders the panel) and every component
// that opens it. Lives outside the component file so Fast Refresh stays happy.
export const RepoDetailContext = createContext(() => {});

/** Returns openRepo(repo). Call it from any row or card to show that repo's
 *  detail panel instead of leaving the dashboard for GitHub. */
export function useRepoDetail() {
  return useContext(RepoDetailContext);
}
