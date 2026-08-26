import { useOutletContext } from "react-router-dom";
import RepositoriesTable from "../components/dashboard/RepositoriesTable.jsx";

export default function Repositories() {
  const data = useOutletContext();
  const all = data.all_repos || data.repos || [];

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Repositories</h1>
        <p className="font-body-md text-body-md text-text-muted-dark mt-xs">
          {all.length} AI repositories tracked across {data.topic_count} topics.
        </p>
      </div>
      <RepositoriesTable repos={all} />
    </div>
  );
}
